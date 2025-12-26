import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const body = await req.json();

  const system = `
You draft HOA violation notices.
If community guidelines include section numbers, titles, or headings,
cite the exact section when relevant.
Never invent sections.
Maintain professional HOA tone.
  `;

  const user = `
Community: ${body.communityName}
Violation: ${body.violationType}
Tone: ${body.tone}
Guidelines:
${body.guidelines || "None provided"}
  `;

  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    temperature: 0.3
  });

  return NextResponse.json({ letter: r.choices[0].message.content });
}
