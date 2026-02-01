"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function AuthHeader() {
  const pathname = usePathname();
  const isDebateRoom =
    /^\/[^/]+\/[^/]+$/.test(pathname) && !pathname.startsWith("/sign-");

  if (
    pathname === "/" ||
    pathname === "/home" ||
    pathname.startsWith("/rooms") ||
    pathname.startsWith("/settings") ||
    pathname === "/topics" ||
    isDebateRoom
  ) {
    return null;
  }

  return (
    <header className="flex items-center justify-end gap-4 px-6 py-4 text-sm">
      <SignedOut>
        <SignInButton>
          <button className="rounded-full border border-[var(--line)] px-4 py-2 font-semibold text-[var(--ink)]">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton>
          <button className="rounded-full bg-[var(--ink)] px-4 py-2 font-semibold text-[var(--sand)]">
            Sign up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
