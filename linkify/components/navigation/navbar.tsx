"use client";

import { buttonVariants } from "@/linkify/components/ui/button";
import { cn } from "@/linkify/utils";
import { useClerk } from "@clerk/nextjs";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import Link from "next/link";
import { useEffect, useState } from 'react';
import MaxWidthWrapper from "../global/max-width-wrapper";
import MobileNavbar from "./mobile-navbar";
import AnimationContainer from "../global/animation-container";

const Navbar = () => {

    const { user } = useClerk();
    const signInHref = "/sign-in?redirect_url=/home";

    const [scroll, setScroll] = useState(false);

    const handleScroll = () => {
        if (window.scrollY > 8) {
            setScroll(true);
        } else {
            setScroll(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <header className={cn(
            "sticky top-0 inset-x-0 h-14 w-full border-b border-transparent z-[99999] select-none",
            scroll && "border-background/80 bg-background/40 backdrop-blur-md"
        )}>
            <AnimationContainer reverse delay={0.1} className="size-full">
                <MaxWidthWrapper className="flex items-center justify-between">
                    <div className="flex items-center space-x-12">
                        <Link href="/#home">
                            <span className="text-lg font-bold font-heading !leading-none text-white">
                                Podium
                            </span>
                        </Link>

                    </div>

                    <div className="hidden lg:flex items-center">
                        {user ? (
                            <div className="flex items-center">
                                <Link href="/home" className={buttonVariants({ size: "sm", })}>
                                    Home
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-x-4">
                                <Link href={signInHref} className={buttonVariants({ size: "sm", variant: "ghost" })}>
                                    Sign In
                                </Link>
                                <Link
                                  href={signInHref}
                                  className={buttonVariants({
                                    size: "sm",
                                    className:
                                      "bg-white text-black hover:bg-white/90",
                                  })}
                                >
                                    Get Started
                                    <HiOutlineSpeakerphone className="size-4 ml-1.5 text-black" />
                                </Link>
                            </div>
                        )}
                    </div>

                    <MobileNavbar />

                </MaxWidthWrapper>
            </AnimationContainer>
        </header>
    )
};

export default Navbar
