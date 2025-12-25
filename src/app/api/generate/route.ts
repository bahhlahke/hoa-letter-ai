import { NextResponse } from "next/server";
import OpenAI from "openai";

// Configure the OpenAI client with the API key from environment variables.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Helper to safely coerce potentially unknown values into strings and
// truncate them to a maximum length. This helps prevent prompt injection
// and ensures that overly long user inputs don't cause issues.
function safeStr(value: unknown, max = 1200) {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const violationType = safeStr(body.violationType, 64) || "Other";
    const tone = safeStr(body.tone, 32) || "Neutral";
    const dueDate = safeStr(body.dueDate, 80);
    const communityName = safeStr(body.communityName, 80);
    const ruleRef = safeStr(body.ruleRef, 120);
    const details = safeStr(body.details, 800);

    // Compose system and user messages for the language model. The system
    // message instructs the assistant on style and safety constraints. The
    // user message includes all the structured form inputs.
    const system = `You write concise, professional HOA violation letters.\n\nRules:\n- Use a non-accusatory, factual tone.\n- Do not threaten legal action or mention fines unless explicitly provided in the user's details.\n- Include what was observed, a request to correct, any due date if provided, and a contact line.\n- Keep the letter under 250 words.\n- Output only the letter text.`;

    const user = `Generate an HOA violation letter.\n\nCommunity name: ${communityName || "(not provided)"}\nViolation type: ${violationType}\nTone: ${tone}\nDue date: ${dueDate || "(not provided)"}\nRule reference: ${ruleRef || "(not provided)"}\nAdditional details: ${details || "(none)"}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      max_tokens: 300,
    });

    const letter = completion.choices?.[0]?.message?.content?.trim() || "";
    if (!letter) {
      return NextResponse.json({ error: "Empty response from language model" }, { status: 500 });
    }
    return NextResponse.json({ letter });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message ?? "Server error" }, { status: 500 });
  }
}