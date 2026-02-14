import React from 'react';
import Image from 'next/image';

import WaitlistForm from "@/app/components/WaitlistForm";
import { heroDetails } from "@/components/landing/data/hero";

const Hero: React.FC = () => {
    return (
        <section
            id="hero"
            className="relative flex items-center justify-center pb-0 pt-32 md:pt-40 px-5"
            style={{
                backgroundColor: "hsl(var(--hero-background))",
                backgroundImage:
                    "repeating-linear-gradient(to right, rgba(0,0,0,0.045) 0 1px, transparent 1px 44px), repeating-linear-gradient(to bottom, rgba(0,0,0,0.045) 0 1px, transparent 1px 44px)",
                WebkitMaskImage:
                    "radial-gradient(ellipse 60% 55% at 50% 50%, black 0%, black 55%, transparent 100%)",
                maskImage:
                    "radial-gradient(ellipse 60% 55% at 50% 50%, black 0%, black 55%, transparent 100%)",
            }}
        >

            <div className="absolute left-0 right-0 bottom-0 backdrop-blur-[2px] h-40 bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.5)] to-[rgba(202,208,230,0.5)]">
            </div>

            <div className="text-center">
                <h1 className="text-4xl md:text-6xl md:leading-tight font-bold text-black max-w-lg md:max-w-2xl mx-auto">{heroDetails.heading}</h1>
                <p className="mt-4 text-black max-w-lg mx-auto">{heroDetails.subheading}</p>
                <div className="mt-6 flex flex-col sm:flex-row items-center sm:gap-4 w-fit mx-auto">
                    <WaitlistForm variant="light" />
                </div>
                <Image
                    src={heroDetails.centerImageSrc}
                    width={384}
                    height={340}
                    quality={100}
                    sizes="(max-width: 768px) 100vw, 384px"
                    priority={true}
                    unoptimized={true}
                    alt="app mockup"
                    className='relative mt-12 md:mt-16 mx-auto z-10'
                />
            </div>
        </section>
    );
};

export default Hero;
