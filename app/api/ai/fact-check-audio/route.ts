import { NextRequest, NextResponse } from "next/server";
import { auth, getAuth } from "@clerk/nextjs/server";

type FactIssue = {
  claim: string;
  correction: string;
  confidence: number;
};

function parseIssues(raw: string): FactIssue[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    return [];
  }
  const parsed = JSON.parse(match[0]) as Array<{
    claim?: unknown;
    correction?: unknown;
    confidence?: unknown;
  }>;
  return parsed
    .map((item) => ({
      claim: typeof item.claim === "string" ? item.claim.trim() : "",
      correction:
        typeof item.correction === "string" ? item.correction.trim() : "",
      confidence:
        typeof item.confidence === "number"
          ? Math.min(1, Math.max(0, item.confidence))
          : 0,
    }))
    .filter((item) => item.claim && item.correction && item.confidence >= 0.8);
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const fallbackAuth = getAuth(request);
    const resolvedUserId = userId ?? fallbackAuth.userId;
    if (!resolvedUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY on server." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    const roomTitle =
      typeof formData.get("roomTitle") === "string"
        ? String(formData.get("roomTitle"))
        : "";
    const activeTopic =
      typeof formData.get("activeTopic") === "string"
        ? String(formData.get("activeTopic"))
        : "";

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const transcriptForm = new FormData();
    transcriptForm.append("file", audio, "snippet.webm");
    transcriptForm.append("model", "gpt-4o-mini-transcribe");

    const transcriptionRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: transcriptForm,
      }
    );

    if (!transcriptionRes.ok) {
      const errorText = await transcriptionRes.text();
      return NextResponse.json(
        { error: `Transcription failed: ${errorText}` },
        { status: 502 }
      );
    }

    const transcription = await transcriptionRes.json();
    const transcriptText =
      typeof transcription?.text === "string" ? transcription.text.trim() : "";
    if (!transcriptText) {
      return NextResponse.json({ transcript: "", issues: [] });
    }

    const checkPrompt = `
You are a strict fact checker for a live debate.
Input:
- Room: ${roomTitle || "Debate room"}
- Topic: ${activeTopic || "General"}
- Transcript snippet: ${transcriptText}

Return ONLY a JSON array (no markdown) with high-confidence factual issues.
Each object:
{
  "claim": "original potentially incorrect claim",
  "correction": "short correction",
  "confidence": number from 0 to 1
}

Rules:
- If nothing clearly wrong, return [].
- Only include issues with confidence >= 0.8.
- Keep outputs concise.
`;

    const factRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: checkPrompt,
        temperature: 0.1,
      }),
    });

    if (!factRes.ok) {
      const errorText = await factRes.text();
      return NextResponse.json(
        { error: `Fact check failed: ${errorText}` },
        { status: 502 }
      );
    }

    const factJson = await factRes.json();
    const issues = parseIssues((factJson?.output_text as string) ?? "");
    return NextResponse.json({
      transcript: transcriptText,
      issues,
    });
  } catch (error) {
    console.error("[ai/fact-check-audio] failed", error);
    return NextResponse.json(
      { error: "Unable to run AI fact check right now." },
      { status: 500 }
    );
  }
}

