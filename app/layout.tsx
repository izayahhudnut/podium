import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastStateProvider } from "@/components/ui/use-toast";
import LayoutShell from "./components/LayoutShell";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--finwise-font-heading",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--finwise-font-body",
});

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
      signInFallbackRedirectUrl="/home"
      signUpFallbackRedirectUrl="/home"
      localization={{
        signIn: {
          start: {
            title: "Sign in to Podium",
            subtitle: "Welcome back! Please sign in to continue.",
          },
        },
      }}
    >
      <html lang="en">
        <body
          className={`${manrope.variable} ${sourceSans.variable} antialiased font-sans`}
        >
          <ToastStateProvider>
            <LayoutShell>{children}</LayoutShell>
            <Toaster />
          </ToastStateProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
