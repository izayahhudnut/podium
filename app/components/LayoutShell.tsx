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

  if (isLanding) {
    return (
      <div className="finwise-theme min-h-screen bg-background text-foreground">
        <LandingHeader />
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
