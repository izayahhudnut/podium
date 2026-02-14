"use client";

import Link from "next/link";
import Image from "next/image";
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
        <header className="bg-transparent fixed top-0 left-0 right-0 md:absolute z-50 mx-auto w-full">
            <Container className="!px-0">
                <nav className="shadow-md md:shadow-none bg-white md:bg-transparent mx-auto flex justify-between items-center py-2 px-5 md:py-10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src={siteDetails.siteLogo}
                            alt={siteDetails.siteName}
                            width={28}
                            height={28}
                            className="min-w-fit"
                        />
                        <span className="manrope text-xl font-semibold text-black cursor-pointer">
                            {siteDetails.siteName}
                        </span>
                    </Link>

                    <div className="hidden md:flex">
                        <Link
                            href="/sign-in"
                            className="text-black bg-primary hover:bg-primary-accent px-6 py-2 rounded-full transition-colors font-medium"
                        >
                            Sign in
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="bg-primary text-black focus:outline-none rounded-full w-10 h-10 flex items-center justify-center"
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
                <div id="mobile-menu" className="md:hidden bg-white shadow-lg">
                    <div className="pt-4 pb-6 px-6">
                        <Link
                            href="/sign-in"
                            className="text-black bg-primary hover:bg-primary-accent px-5 py-2 rounded-full w-fit font-medium"
                            onClick={toggleMenu}
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            ) : null}
        </header>
    );
};

export default Header;
