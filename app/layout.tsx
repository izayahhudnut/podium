import type { Metadata } from "next";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { Bebas_Neue, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthHeader from "./components/AuthHeader";
import { Toaster } from "@/components/ui/toaster";
import { ToastStateProvider } from "@/components/ui/use-toast";

const displayFont = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
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
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
    >
      <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased`}
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
