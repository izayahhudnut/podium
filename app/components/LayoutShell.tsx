"use client";

import { usePathname } from "next/navigation";
import AuthHeader from "./AuthHeader";
import LandingHeader from "@/components/landing/Header";

type LayoutShellProps = {
  children: React.ReactNode;
};

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isWaitlist = pathname?.startsWith("/waitlist");

  if (isLanding) {
    return (
      <div className="finwise-theme min-h-screen bg-[#0F0C14] text-white">
        <LandingHeader />
        <main>{children}</main>
      </div>
    );
  }

  if (isWaitlist) {
    return (
      <div className="finwise-theme min-h-screen bg-[#0F0C14] text-white">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
