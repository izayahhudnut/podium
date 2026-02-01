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

export default function AppTopbar() {
  const router = useRouter();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3" />
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:border-black/30 hover:bg-black/5"
          onClick={() => router.push("/rooms?create=1")}
        >
          <HiOutlineSpeakerphone className="h-4 w-4" />
          Start debate
        </button>
        <SignedOut>
          <SignInButton>
            <button className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
              Sign up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
