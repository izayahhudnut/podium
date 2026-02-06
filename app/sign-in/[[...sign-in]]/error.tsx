"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInErrorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-sm text-white/60">
      Redirecting...
    </div>
  );
}

