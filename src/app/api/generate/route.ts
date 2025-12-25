import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function safeStr(v: unknown, max = 1200): string {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const violationType = safeStr(body.violationType, 64) || "Other";
    const tone = safeStr(body.tone, 32) || "Neutral";
    const dueDate = safeStr(body.dueDate, 80);
    const communityName = safeStr(body.communityName, 80);
    const ruleRef = safeStr(body.ruleRef, 140);
    const details = safeStr(body.details, 900);

    const system = [
      "You write concise, professional HOA violation letters.",
      "Rules:",
      "- Non-accusatory, factual tone. No threats. No legal advice.",
      "- Do not mention fines or legal action unless explicitly included in the user 'details'.",
      "- Include: what was observed, request to correct, a due date if provided, and a contact line.",
      "- Keep it under 250 words.",
      "- Output only the letter text, no headings like 'Subject:' unless user requested."
    ].join("\n");

    const user = `Generate an HOA violation letter.

Community name: ${communityName || "(not provided)"}
Violation type: ${violationType}
Tone: ${tone}
Due date: ${dueDate || "(not provided)"}
Rule reference: ${ruleRef || "(not provided)"}
Additional details: ${details || "(none)"}
`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.35
    });

    const letter = resp.choices?.[0]?.message?.content?.trim() || "";
    if (!letter) return NextResponse.json({ error: "Empty output" }, { status: 500 });

    return NextResponse.json({ letter });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
