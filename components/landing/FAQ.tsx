"use client";

import React from "react";
import SectionTitle from "./SectionTitle";
import { faqs } from "@/components/landing/data/faq";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/linkify/components/ui/accordion";

const FAQ: React.FC = () => {
    return (
        <section id="faq" className="py-10 lg:py-20">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="">
                    <p className="hidden lg:block text-foreground-accent">FAQ&apos;S</p>
                    <SectionTitle>
                        <h2 className="my-3 !leading-snug lg:max-w-sm text-center lg:text-left">Frequently Asked Questions</h2>
                    </SectionTitle>
                    <p className="lg:mt-10 text-foreground-accent text-center lg:text-left">
                        Ask us anything!
                    </p>
                    <a href="mailto:support@podiumlive.io" className="mt-3 block text-xl lg:text-4xl text-secondary font-semibold hover:underline text-center lg:text-left">support@podiumlive.io</a>
                </div>

                <div className="w-full lg:max-w-2xl mx-auto border-b">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`faq-${index}`} className="border-t">
                                <AccordionTrigger className="flex items-center justify-between w-full px-4 pt-7 text-left text-foreground hover:text-foreground">
                                    <span className="text-2xl font-semibold">{faq.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-4 pb-2 text-foreground-accent">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
