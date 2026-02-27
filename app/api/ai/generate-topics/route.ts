import { NextRequest, NextResponse } from "next/server";
import { auth, getAuth } from "@clerk/nextjs/server";

type SuggestedTopic = {
  title: string;
  minutes: number;
};

function extractJsonArray(raw: string): SuggestedTopic[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    return [];
  }
  const parsed = JSON.parse(match[0]) as Array<{
    title?: unknown;
    minutes?: unknown;
  }>;
  return parsed
    .map((item) => ({
      title: typeof item.title === "string" ? item.title.trim() : "",
      minutes:
        typeof item.minutes === "number"
          ? Math.min(60, Math.max(1, Math.round(item.minutes)))
          : 5,
    }))
    .filter((item) => Boolean(item.title));
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

    const body = await request.json();
    const roomTitle =
      typeof body?.roomTitle === "string" ? body.roomTitle.trim() : "";
    const existingTopics = (Array.isArray(body?.existingTopics)
      ? body.existingTopics
      : []) as Array<{ title?: unknown }>;

    const existing = existingTopics
      .map((item) => (typeof item?.title === "string" ? item.title : ""))
      .filter(Boolean)
      .slice(0, 20);

    const prompt = `
You generate concise debate topics.
Return ONLY a JSON array (no markdown) of 4-6 objects with:
- "title": string
- "minutes": integer between 2 and 12

Room title: ${roomTitle || "Untitled debate"}
Existing topics: ${existing.length ? existing.join(" | ") : "none"}

Make topics non-duplicative and progressively structured (opening, core angles, closing).
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenAI generate failed: ${errorText}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const text = (result?.output_text as string) ?? "";
    const topics = extractJsonArray(text);

    if (!topics.length) {
      return NextResponse.json(
        { error: "AI returned no valid topics." },
        { status: 422 }
      );
    }

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("[ai/generate-topics] failed", error);
    return NextResponse.json(
      { error: "Unable to generate topics right now." },
      { status: 500 }
    );
  }
}
