import { NextResponse } from "next/server";
import { auth, getAuth } from "@clerk/nextjs/server";
import {
  deleteRoom,
  getRoomBySlug,
  updateRoomStatus,
  updateRoomVisibility,
} from "@/lib/rooms";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ username?: string; slug?: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { username, slug } = await context.params;
  if (!username || !slug) {
    return NextResponse.json(
      { error: "Missing username or slug" },
      { status: 400 }
    );
  }

  const room = await getRoomBySlug(username, slug);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ room });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { userId } = auth();
  const fallbackAuth = getAuth(request);
  const resolvedUserId = userId ?? fallbackAuth.userId;
  if (!resolvedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const status =
    payload?.status === "active" || payload?.status === "ended"
      ? payload.status
      : null;
  const isPublic =
    typeof payload?.is_public === "boolean" ? payload.is_public : null;

  if (!status && isPublic === null) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  let room = null;
  if (status) {
    room = await updateRoomStatus(slug, resolvedUserId, status);
  }
  if (isPublic !== null) {
    room = await updateRoomVisibility(slug, resolvedUserId, isPublic);
  }
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ room });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { userId } = auth();
  const fallbackAuth = getAuth(request);
  const resolvedUserId = userId ?? fallbackAuth.userId;
  if (!resolvedUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = await deleteRoom(slug, resolvedUserId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ room });
}
