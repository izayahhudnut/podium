"use client";

import Link from "next/link";
import React from "react";

import Container from "./Container";
import { siteDetails } from "@/components/landing/data/siteDetails";

const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 mx-auto w-full bg-[#0F0D13]/90 backdrop-blur">
            <Container className="!px-0">
                <nav className="mx-auto flex justify-between items-center py-2 px-5 md:py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="manrope text-xl font-semibold text-white cursor-pointer">
                            {siteDetails.siteName}
                        </span>
                    </Link>

                    <Link
                        href="/sign-in"
                        className="hidden md:block bg-white text-black hover:bg-white/90 px-6 py-2 rounded-full transition-colors font-medium"
                    >
                        Log in
                    </Link>

                    <Link
                        href="/sign-in"
                        className="md:hidden text-white font-medium"
                    >
                        Log in
                    </Link>
                </nav>
            </Container>
        </header>
    );
};

export default Header;
