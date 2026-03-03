import React from "react";
import Link from "next/link";
import Container from "@/components/landing/Container";

const CTA: React.FC = () => {
    return (
        <section
            id="cta"
            className="relative overflow-hidden bg-[#0F0D13] py-28 md:py-36"
        >
            <Container>
                <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center text-white">
                    <h2 className="text-3xl font-bold leading-tight md:text-5xl">Get Started Today</h2>
                    <p className="mt-3 max-w-2xl text-white/70">
                        Join the waitlist and be first to launch your next debate or speech on Podium.
                    </p>
                    <Link
                        href="/waitlist"
                        className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                    >
                        Join waitlist
                    </Link>
                </div>
            </Container>
        </section>
    );
};

export default CTA
