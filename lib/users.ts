import "server-only";

import { supabaseRequest } from "./supabase";

export type AppUser = {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type UpsertUserInput = {
  id: string;
  username?: string | null;
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export async function upsertUser(input: UpsertUserInput): Promise<AppUser> {
  const users = await supabaseRequest<AppUser[]>("users", {
    method: "POST",
    headers: {
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    query: {
      on_conflict: "id",
    },
    body: {
      id: input.id,
      username: input.username ?? null,
      full_name: input.fullName ?? null,
      email: input.email ?? null,
      avatar_url: input.avatarUrl ?? null,
      updated_at: new Date().toISOString(),
    },
  });

  const user = users[0];
  if (!user) {
    throw new Error("Supabase did not return user");
  }
  return user;
}
