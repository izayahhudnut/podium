import { NextResponse } from "next/server";
import { auth, getAuth } from "@clerk/nextjs/server";
import { RtcTokenBuilder, RtcRole, RtmTokenBuilder } from "agora-token";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { userId } = auth();
  const fallback = getAuth(request);
  const resolvedUserId = userId ?? fallback.userId;

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const uid = searchParams.get("uid") ?? resolvedUserId ?? null;

  if (!channel || !uid) {
    return NextResponse.json(
      { error: "Missing channel or uid" },
      { status: 400 }
    );
  }

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return NextResponse.json({ error: "Missing Agora env" }, { status: 500 });
  }

  const expireSeconds = 60 * 60;
  const rtcToken = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    uid,
    RtcRole.PUBLISHER,
    expireSeconds,
    expireSeconds
  );
  const rtmToken = RtmTokenBuilder.buildToken(
    appId,
    appCertificate,
    uid,
    expireSeconds
  );

  return NextResponse.json({
    appId,
    channel,
    uid,
    rtcToken,
    rtmToken,
    expiresIn: expireSeconds,
  });
}
