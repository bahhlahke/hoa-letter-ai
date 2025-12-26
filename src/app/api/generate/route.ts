import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function safeStr(v: unknown, max = 2000): string {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const violationType = safeStr(body.violationType, 64) || "Other";
    const tone = safeStr(body.tone, 32) || "Neutral";
    const dueDate = safeStr(body.dueDate, 80);
    const communityName = safeStr(body.communityName, 120);
    const ruleRef = safeStr(body.ruleRef, 180);
    const details = safeStr(body.details, 1000);

    const guidelinesText = safeStr(body.guidelinesText, 5000);
    const guidelinesUrl = safeStr(body.guidelinesUrl, 500);
    const letterhead = safeStr(body.letterhead, 800);

    let fetchedGuidelines = "";
    if (guidelinesUrl) {
      try {
        const r = await fetch(guidelinesUrl);
        if (r.ok) fetchedGuidelines = safeStr(await r.text(), 5000);
      } catch {}
    }

    const system = [
      "You draft professional HOA violation notices.",
      "If guidelines contain section numbers/titles/headings, cite the EXACT relevant section(s) verbatim by identifier (e.g., 'Section 4.2 (Parking)').",
      "Never invent or guess section numbers.",
      "Tone must be non-accusatory, factual, and respectful.",
      "No legal advice. Do not threaten fines/legal action unless explicitly stated in the provided details/guidelines.",
      "Keep it under 250 words.",
      "Output only the letter body text."
    ].join("\n");

    const user = `Create an HOA notice.

Community: ${communityName || "(not provided)"}
Violation type: ${violationType}
Tone: ${tone}
Due date: ${dueDate || "(not provided)"}
Rule reference: ${ruleRef || "(not provided)"}
Details: ${details || "(none)"}

Guidelines (pasted):
${guidelinesText || "(none)"}

Guidelines (from URL):
${fetchedGuidelines || "(none)"}

If guidelines are present, add 1-2 short citations like:
"Per Section X (Title)..."
`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.35
    });

    let letter = resp.choices?.[0]?.message?.content?.trim() || "";
    if (!letter) return NextResponse.json({ error: "Empty output" }, { status: 500 });

    if (letterhead) {
      letter = `${letterhead}\n\n${letter}`;
    }

    return NextResponse.json({ letter });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
