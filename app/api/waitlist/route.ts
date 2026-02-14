import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    await client.waitlistEntries.create({
      emailAddress: email,
      notify: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const message =
      error?.errors?.[0]?.longMessage ??
      error?.errors?.[0]?.message ??
      "Unable to join the waitlist right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
