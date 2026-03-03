"use client";

import Link from "next/link";
import React, { useState } from "react";
import { HiOutlineXMark, HiBars3 } from "react-icons/hi2";

import Container from "./Container";
import { siteDetails } from "@/components/landing/data/siteDetails";

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

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

                    <div className="hidden md:flex">
                        <Link
                            href="/waitlist"
                            className="bg-white text-black hover:bg-white/90 px-6 py-2 rounded-full transition-colors font-medium"
                        >
                            Join waitlist
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="bg-white text-black focus:outline-none rounded-full w-10 h-10 flex items-center justify-center"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <HiBars3 className="h-6 w-6" aria-hidden="true" />
                            )}
                            <span className="sr-only">Toggle navigation</span>
                        </button>
                    </div>
                </nav>
            </Container>

            {/* Mobile Menu */}
            {isOpen ? (
                <div id="mobile-menu" className="md:hidden bg-[#0F0D13] shadow-lg">
                    <div className="pt-4 pb-6 px-6">
                        <Link
                            href="/waitlist"
                            className="bg-white text-black hover:bg-white/90 px-5 py-2 rounded-full w-fit font-medium"
                            onClick={toggleMenu}
                        >
                            Join waitlist
                        </Link>
                    </div>
                </div>
            ) : null}
        </header>
    );
};

export default Header;
