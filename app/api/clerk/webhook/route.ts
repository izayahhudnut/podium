import { headers } from "next/headers";
import { Webhook } from "svix";
import { upsertUser } from "@/lib/users";

type ClerkEmail = {
  id: string;
  email_address: string;
};

type ClerkUser = {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmail[];
  image_url?: string | null;
};

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const body = await request.text();
  const wh = new Webhook(secret);

  let event: any;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const data = event.data as ClerkUser;
    const fullName = [data.first_name, data.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    const primaryEmail =
      data.email_addresses?.find(
        (email) => email.id === data.primary_email_address_id
      )?.email_address ?? data.email_addresses?.[0]?.email_address ?? null;

    await upsertUser({
      id: data.id,
      username: data.username ?? null,
      fullName: fullName || null,
      email: primaryEmail,
      avatarUrl: data.image_url ?? null,
    });
  }

  return new Response("OK", { status: 200 });
}
