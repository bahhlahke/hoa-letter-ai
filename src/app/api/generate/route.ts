import { NextResponse } from "next/server";
import OpenAI from "openai";
import { rateLimit, getIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function safeStr(v: unknown, max = 2000): string {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    const limit = rateLimit({ key: `generate:${ip}`, limit: 10, windowMs: 60_000 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many drafts right now. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();

    const letterType = safeStr(body.letterType, 64) || "General notice";
    const violationType = safeStr(body.violationType, 64) || "Other";
    const tone = safeStr(body.tone, 32) || "Neutral";
    const letterDate = safeStr(body.letterDate, 120) || new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const dueDate = safeStr(body.dueDate, 120);
    const homeownerName = safeStr(body.homeownerName, 120);
    const homeownerAddress = safeStr(body.homeownerAddress, 240);
    const propertyAddress = safeStr(body.propertyAddress, 240);
    const incidentDate = safeStr(body.incidentDate, 120);
    const amountDue = safeStr(body.amountDue, 120);
    const appealReason = safeStr(body.appealReason, 400);
    const subjectLine = safeStr(body.subjectLine, 200);
    const communityName = safeStr(body.communityName, 120);
    const senderName = safeStr(body.senderName, 120);
    const senderTitle = safeStr(body.senderTitle, 120);
    const senderContact = safeStr(body.senderContact, 200);
    const replyInstructions = safeStr(body.replyInstructions, 400);
    const ruleRef = safeStr(body.ruleRef, 180);
    const autoRuleFromGuidelines = Boolean(body.autoRuleFromGuidelines);
    const details = safeStr(body.details, 1000);

    const guidelinesText = safeStr(body.guidelinesText, 5000);
    const guidelinesUrl = safeStr(body.guidelinesUrl, 500);
    const letterhead = safeStr(body.letterhead, 800);

    let fetchedGuidelines = "";
    if (guidelinesUrl) {
      try {
        const r = await fetch(guidelinesUrl);
        if (r.ok) fetchedGuidelines = safeStr(await r.text(), 5000);
      } catch {
        fetchedGuidelines = "";
      }
    }

    const hasGuidelineText = Boolean((guidelinesText || fetchedGuidelines).trim());

    const systemLines = [
      "You draft professional HOA letters across multiple categories (violation notice, delinquency, appeal response, welcome, architectural request, and general notices).",
      "Tone must be non-accusatory, factual, and respectful.",
      "No legal advice. Do not threaten fines/legal action unless explicitly stated in the provided details/guidelines.",
      "Keep it under 300 words.",
      "Format like an official letter: letterhead (if provided), date, recipient block, subject/RE line, salutation, organized paragraphs, and a polite closing + signature placeholder.",
      "When sender name/title/contact are provided, include them in the closing block to make replying easy.",
      "Use the provided letter date; if absent, use today's date in a friendly format (e.g., May 1, 2024).",
      "Use solution-focused wording even for violation or delinquency topics.",
    ];

    if (hasGuidelineText) {
      systemLines.push(
        "If guidelines contain section numbers/titles/headings, cite the EXACT relevant section(s) verbatim by identifier (e.g., 'Section 4.2 (Parking)').",
        "Only cite sections that appear verbatim in the provided guidelines text below. If unsure, say 'No exact section found.'"
      );
    } else {
      systemLines.push(
        "Do not invent or guess section numbers. If no guideline text is provided, avoid fabricated citations and keep language factual."
      );
    }

    if (autoRuleFromGuidelines && hasGuidelineText) {
      systemLines.push(
        "If the rule reference is requested automatically, pick the single most relevant section from the provided guidelines text without inventing identifiers. If none apply, state that no specific section was provided."
      );
    }

    const system = systemLines.join("\n");

    const user = `Create an HOA ${letterType}.

Community: ${communityName || "(not provided)"}
Violation/Topic: ${violationType}
Tone: ${tone}
Letter date: ${letterDate}
Subject/RE line: ${subjectLine || "(not provided)"}
Homeowner name: ${homeownerName || "(not provided)"}
Homeowner mailing address: ${homeownerAddress || "(not provided)"}
Property address: ${propertyAddress || "(not provided)"}
Incident/notice date: ${incidentDate || "(not provided)"}
Compliance/payment deadline: ${dueDate || "(not provided)"}
Amount due: ${amountDue || "(not provided)"}
Appeal reason/decision: ${appealReason || "(not provided)"}
Sender name: ${senderName || "(not provided)"}
Sender title: ${senderTitle || "(not provided)"}
Sender contact: ${senderContact || "(not provided)"}
Reply instructions for homeowner: ${replyInstructions || "(not provided)"}
Rule reference: ${ruleRef || (autoRuleFromGuidelines ? "(auto-select from guidelines)" : "(not provided)")}
Details/context: ${details || "(none)"}

Guidelines (pasted):
${guidelinesText || "(none)"}

Guidelines (from URL):
${fetchedGuidelines || "(none)"}

Auto-select rule reference from guidelines: ${autoRuleFromGuidelines ? "Yes—choose the best matching section and cite it" : "No"}

If guidelines or rule references are present, add 1-2 short citations like:
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
