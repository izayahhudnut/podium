import "server-only";

import { supabaseRequest } from "./supabase";

export type Room = {
  id: string;
  owner_id: string;
  owner_username: string;
  title: string;
  slug: string;
  template: string | null;
  livekit_room: string | null;
  status: "active" | "ended";
  is_public: boolean;
  header_image_url: string | null;
  created_at: string;
  ended_at: string | null;
};

type CreateRoomInput = {
  ownerId: string;
  ownerUsername: string;
  title: string;
  slug: string;
  template: string | null;
  livekitRoom: string;
  isPublic: boolean;
  headerImageUrl: string | null;
};

export async function getRoomsByOwner(ownerId: string): Promise<Room[]> {
  return supabaseRequest<Room[]>("rooms", {
    query: {
      select:
        "id,owner_id,owner_username,title,slug,template,livekit_room,status,is_public,header_image_url,created_at,ended_at",
      owner_id: `eq.${ownerId}`,
      order: "created_at.desc",
    },
  });
}

export async function getRoomBySlug(
  ownerUsername: string,
  slug: string
): Promise<Room | null> {
  const rooms = await supabaseRequest<Room[]>("rooms", {
    query: {
      select:
        "id,owner_id,owner_username,title,slug,template,livekit_room,status,is_public,header_image_url,created_at,ended_at",
      owner_username: `eq.${ownerUsername}`,
      slug: `eq.${slug}`,
      limit: "1",
    },
  });
  return rooms[0] ?? null;
}

export async function getPublicRooms(): Promise<Room[]> {
  return supabaseRequest<Room[]>("rooms", {
    query: {
      select:
        "id,owner_id,owner_username,title,slug,template,livekit_room,status,is_public,header_image_url,created_at,ended_at",
      is_public: "eq.true",
      status: "eq.active",
      order: "created_at.desc",
      limit: "6",
    },
  });
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const rooms = await supabaseRequest<Room[]>("rooms", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: {
      owner_id: input.ownerId,
      owner_username: input.ownerUsername,
      title: input.title,
      slug: input.slug,
      template: input.template,
      livekit_room: input.livekitRoom,
      status: "active",
      is_public: input.isPublic,
      header_image_url: input.headerImageUrl,
    },
  });

  const room = rooms[0];
  if (!room) {
    throw new Error("Supabase did not return created room");
  }
  return room;
}

export async function updateRoomStatus(
  slug: string,
  ownerId: string,
  status: "active" | "ended"
): Promise<Room | null> {
  const rooms = await supabaseRequest<Room[]>("rooms", {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
    },
    query: {
      slug: `eq.${slug}`,
      owner_id: `eq.${ownerId}`,
    },
    body: {
      status,
      ended_at: status === "ended" ? new Date().toISOString() : null,
    },
  });

  return rooms[0] ?? null;
}

export async function updateRoomVisibility(
  slug: string,
  ownerId: string,
  isPublic: boolean
): Promise<Room | null> {
  const rooms = await supabaseRequest<Room[]>("rooms", {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
    },
    query: {
      slug: `eq.${slug}`,
      owner_id: `eq.${ownerId}`,
    },
    body: {
      is_public: isPublic,
    },
  });

  return rooms[0] ?? null;
}

export async function deleteRoom(
  slug: string,
  ownerId: string
): Promise<Room | null> {
  const rooms = await supabaseRequest<Room[]>("rooms", {
    method: "DELETE",
    headers: {
      Prefer: "return=representation",
    },
    query: {
      slug: `eq.${slug}`,
      owner_id: `eq.${ownerId}`,
    },
  });

  return rooms[0] ?? null;
}
