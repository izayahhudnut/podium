import React from 'react';
import Image from 'next/image';

import { heroDetails } from "@/components/landing/data/hero";
import FloatingLines from "@/components/landing/FloatingLines";

const Hero: React.FC = () => {
    const heroTitleWords = "Bring Your Conversations to the Podium.".split(" ");

    return (
        <section
            id="hero"
            className="relative flex items-center justify-center overflow-visible pb-0 pt-20 md:pt-24 px-5"
            style={{
                backgroundColor: "#0F0D13",
                backgroundImage:
                    "repeating-linear-gradient(to right, rgba(255,255,255,0.04) 0 1px, transparent 1px 44px), repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0 1px, transparent 1px 44px)",
            }}
        >
            <div className="pointer-events-none absolute inset-0 z-[1] opacity-80">
                <FloatingLines
                    enabledWaves={["top", "middle", "bottom"]}
                    lineCount={5}
                    lineDistance={5}
                    bendRadius={5}
                    bendStrength={-0.5}
                    interactive={false}
                    parallax={true}
                    linesGradient={["#e947f5", "#2f4ba2", "#9b8cff"]}
                />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[2] bg-[#171717]/20" />

            <div className="relative z-10 text-center">
                <h1 className="mx-auto flex max-w-[920px] flex-wrap justify-center gap-x-3 gap-y-2 px-1 text-4xl font-bold leading-[1.15] text-white md:text-6xl md:leading-[1.1]">
                    {heroTitleWords.map((word, index) => (
                        <span
                            key={`${word}-${index}`}
                            className="whitespace-nowrap"
                            style={{
                                animation: "heroWordIn 0.55s ease-out both",
                                animationDelay: `${index * 0.06}s`,
                            }}
                        >
                            {word}
                        </span>
                    ))}
                </h1>
                <p
                    className="mx-auto mt-4 max-w-2xl text-base text-white/75 md:text-lg"
                    style={{
                        animation: "heroWordIn 0.6s ease-out both",
                        animationDelay: "0.55s",
                    }}
                >
                    The Stage for Conversations That Matter.
                </p>
                <Image
                    src={heroDetails.centerImageSrc}
                    width={236}
                    height={208}
                    quality={100}
                    sizes="(max-width: 768px) 52vw, 236px"
                    priority={true}
                    unoptimized={true}
                    alt="app mockup"
                    draggable={false}
                    className='relative mt-8 md:mt-12 mx-auto z-10 w-[36vw] max-w-[170px] md:w-[52vw] md:max-w-[236px]'
                    style={{
                        animation: "heroImageIn 0.8s ease-out both, heroImageFloat 4.5s ease-in-out infinite",
                        animationDelay: "0.7s, 1.6s",
                    }}
                />
            </div>
        </section>
    );
};

export default Hero;
