import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import AuthHeader from "./components/AuthHeader";
import { Toaster } from "@/components/ui/toaster";
import { ToastStateProvider } from "@/components/ui/use-toast";

export const metadata: Metadata = {
  title: "Podium",
  description: "Host and moderate live debates with precision speaker control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
    >
      <html lang="en">
      <body
        className="antialiased font-sans"
      >
        <ToastStateProvider>
          <AuthHeader />
          {children}
          <Toaster />
        </ToastStateProvider>
      </body>
      </html>
    </ClerkProvider>
  );
}
