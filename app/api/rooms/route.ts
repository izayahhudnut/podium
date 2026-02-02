import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser, getAuth } from "@clerk/nextjs/server";
import { createRoom, getRoomBySlug, getRoomsByOwner } from "@/lib/rooms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const fallbackAuth = getAuth(request);
  const resolvedUserId = userId ?? fallbackAuth.userId;

  if (!resolvedUserId) {
    return NextResponse.json({ rooms: [] });
  }

  const rooms = await getRoomsByOwner(resolvedUserId);
  return NextResponse.json({ rooms });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const fallbackAuth = getAuth(request);
  const resolvedUserId = userId ?? fallbackAuth.userId;

  if (!resolvedUserId) {
    if (process.env.NODE_ENV !== "production") {
      const cookie = request.headers.get("cookie");
      const referer = request.headers.get("referer");
      const origin = request.headers.get("origin");
      const cookieNames = cookie
        ? cookie
            .split(";")
            .map((item) => item.split("=")[0]?.trim())
            .filter(Boolean)
        : [];
      console.warn("[rooms:POST] unauthorized", {
        hasCookie: Boolean(cookie),
        origin,
        referer,
        cookieNames,
      });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const title = typeof payload?.title === "string" ? payload.title.trim() : "";
  const slug = typeof payload?.slug === "string" ? payload.slug.trim() : "";
  const template =
    typeof payload?.template === "string" ? payload.template.trim() : null;
  const isPublic = payload?.is_public === true;
  const headerImageUrl =
    typeof payload?.header_image_url === "string"
      ? payload.header_image_url.trim()
      : null;

  if (!title || !slug) {
    return NextResponse.json({ error: "Missing title or slug" }, { status: 400 });
  }

  const user = await currentUser();
  const ownerUsername =
    user?.username ??
    (user?.firstName ? user.firstName.toLowerCase() : null) ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "guest";

  const existing = await getRoomBySlug(ownerUsername, slug);
  if (existing) {
    return NextResponse.json({ error: "Room already exists" }, { status: 409 });
  }

  const room = await createRoom({
    ownerId: resolvedUserId,
    ownerUsername,
    title,
    slug,
    template,
    livekitRoom: `${ownerUsername}-${slug}`,
    isPublic,
    headerImageUrl,
  });

  return NextResponse.json({ room }, { status: 201 });
}
