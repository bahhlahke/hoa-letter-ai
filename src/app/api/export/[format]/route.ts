import { NextRequest, NextResponse } from "next/server";
import { ensureEntitled, consumeCredit, encodeEntitlementState, serializeEntitlementCookie } from "@/lib/billing/entitlements";
import { buildHoaPdfBytes } from "@/lib/pdfClient";
import { getIp, rateLimit } from "@/lib/rateLimit";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeName(name?: string) {
  return (name || "hoa-notice").toLowerCase().replace(/[^a-z0-9\-]+/gi, "-");
}

async function makeDocx(letter: string) {
  const lines = letter.split(/\r?\n/);
  const paragraphs = lines.map((line) => new Paragraph({ children: [new TextRun({ text: line.length ? line : " " })] }));
  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  return await Packer.toBuffer(doc);
}

export async function POST(req: NextRequest, { params }: { params: { format: string } }) {
  try {
    const ip = getIp(req);
    const limiter = rateLimit({ key: `export:${ip}`, limit: 10, windowMs: 60_000 });
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many exports. Please pause and try again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const entitlement = ensureEntitled("canExportPdf");
    if (!entitlement.allowed) {
      return NextResponse.json({ error: "Upgrade to export or email." }, { status: 402 });
    }

    const body = await req.json();
    const letter = typeof body.letter === "string" ? body.letter : "";
    if (!letter.trim()) return NextResponse.json({ error: "Missing letter content" }, { status: 400 });

    const baseName = safeName(body.fileName || body.violationType);
    const format = params.format?.toLowerCase();

    if (format === "txt") {
      const res = new NextResponse(letter, {
        status: 200,
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
          "Content-Disposition": `attachment; filename=${baseName || "hoa-notice"}.txt`
        }
      });
      if (entitlement.state && !entitlement.state.isSubscriber && entitlement.state.remainingOneTimeCredits > 0) {
        const updated = consumeCredit(entitlement.state);
        const token = encodeEntitlementState(updated);
        res.headers.append("Set-Cookie", serializeEntitlementCookie(token, updated.expiresAt));
      }
      return res;
    }

    if (format === "docx") {
      const buffer = await makeDocx(letter);
      const res = new NextResponse(buffer as any, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename=${baseName || "hoa-notice"}.docx`
        }
      });
      if (entitlement.state && !entitlement.state.isSubscriber && entitlement.state.remainingOneTimeCredits > 0) {
        const updated = consumeCredit(entitlement.state);
        const token = encodeEntitlementState(updated);
        res.headers.append("Set-Cookie", serializeEntitlementCookie(token, updated.expiresAt));
      }
      return res;
    }

    // default PDF
    const bytes = await buildHoaPdfBytes({
      letter,
      letterhead: body.letterhead,
      communityName: body.communityName,
      logoUrl: body.logoUrl,
    });
    const buffer = bytes.buffer.slice(0) as ArrayBuffer;
    const res = new NextResponse(Buffer.from(buffer) as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${baseName || "hoa-notice"}.pdf`
      }
    });
    if (entitlement.state && !entitlement.state.isSubscriber && entitlement.state.remainingOneTimeCredits > 0) {
      const updated = consumeCredit(entitlement.state);
      const token = encodeEntitlementState(updated);
      res.headers.append("Set-Cookie", serializeEntitlementCookie(token, updated.expiresAt));
    }
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Export error" }, { status: 500 });
  }
}
