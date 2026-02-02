import { NextRequest, NextResponse } from "next/server";
import { auth, getAuth } from "@clerk/nextjs/server";
import {
  createTopicTemplate,
  getTopicTemplatesByOwner,
} from "@/lib/topic-templates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const fallbackAuth = getAuth(request);
  const resolvedUserId = userId ?? fallbackAuth.userId;

  if (!resolvedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await getTopicTemplatesByOwner(resolvedUserId);
  return NextResponse.json({ templates });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const fallbackAuth = getAuth(request);
  const resolvedUserId = userId ?? fallbackAuth.userId;
  const resolvedUsername = fallbackAuth.sessionClaims?.username as
    | string
    | undefined;

  if (!resolvedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const title =
    typeof payload?.title === "string" ? payload.title.trim() : "";
  const topics = Array.isArray(payload?.topics) ? payload.topics : [];

  if (!title) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  const template = await createTopicTemplate({
    ownerId: resolvedUserId,
    ownerUsername: resolvedUsername ?? "unknown",
    title,
    topics,
  });

  return NextResponse.json({ template });
}
