"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, GSAPSplitText);

type SplitType = "chars" | "words" | "lines";

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: SplitType;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  tag?: "p" | "h1" | "h2" | "h3" | "div" | "span";
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
};

export default function SplitText({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  tag = "p",
  onLetterAnimationComplete,
  showCallback = false,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const callbackRef = useRef(onLetterAnimationComplete);
  const callbackFiredRef = useRef(false);

  callbackRef.current = onLetterAnimationComplete;

  useEffect(() => {
    const ready = (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
    if (!ready) {
      setFontsLoaded(true);
      return;
    }
    ready.then(() => setFontsLoaded(true)).catch(() => setFontsLoaded(true));
  }, []);

  useGSAP(
    () => {
      if (!fontsLoaded || !ref.current) {
        return;
      }

      const split = new GSAPSplitText(ref.current, { type: splitType });
      const targets =
        splitType === "words"
          ? split.words
          : splitType === "lines"
            ? split.lines
            : split.chars;

      const timeline = gsap.timeline({
        paused: true,
        onComplete: () => {
          if (showCallback && !callbackFiredRef.current) {
            callbackFiredRef.current = true;
            callbackRef.current?.();
          }
        },
      });

      timeline.fromTo(
        targets,
        from,
        {
          ...to,
          duration,
          ease,
          stagger: Math.max(0.001, delay / 1000),
        }
      );

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) {
            return;
          }
          timeline.play();
          observer.disconnect();
        },
        { threshold, rootMargin }
      );

      observer.observe(ref.current);

      return () => {
        observer.disconnect();
        timeline.kill();
        split.revert();
      };
    },
    {
      dependencies: [
        text,
        fontsLoaded,
        splitType,
        delay,
        duration,
        ease,
        threshold,
        rootMargin,
        showCallback,
      ],
      scope: ref,
      revertOnUpdate: true,
    }
  );

  const Tag = tag;
  return (
    <Tag ref={ref as never} className={className} style={{ textAlign }}>
      {text}
    </Tag>
  );
}
