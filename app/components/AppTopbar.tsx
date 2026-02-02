"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function AppTopbar() {
  const router = useRouter();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 text-white">
      <div className="flex items-center gap-3" />
      <div className="flex flex-wrap items-center gap-3">
        <RainbowButton
          className="animate-none rounded-lg border border-white/10 bg-white text-black shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
          onClick={() => router.push("/rooms?create=1")}
        >
          <HiOutlineSpeakerphone className="h-4 w-4" />
          Start debate
        </RainbowButton>
        <SignedOut>
          <SignInButton>
            <button className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:text-white">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90">
              Sign up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-12 w-12",
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
}
