"use client";

import React, { useEffect, useRef } from "react";

export type StarsBackgroundProps = React.ComponentProps<"div"> & {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  starColor?: string;
};

export function StarsBackground({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  starColor = "#fff",
  className,
  ...props
}: StarsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<
    Array<{
      x: number;
      y: number;
      r: number;
      baseAlpha: number;
      twinkleSpeed: number;
      twinklePhase: number;
      twinkle: boolean;
    }>
  >([]);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * window.devicePixelRatio;
      canvas.height = clientHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

      const count = Math.max(20, Math.floor(clientWidth * clientHeight * starDensity));
      const stars = Array.from({ length: count }).map(() => {
        const twinkle = allStarsTwinkle
          ? true
          : Math.random() < twinkleProbability;
        return {
          x: Math.random() * clientWidth,
          y: Math.random() * clientHeight,
          r: Math.random() * 1.4 + 0.2,
          baseAlpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed:
            Math.random() * (maxTwinkleSpeed - minTwinkleSpeed) + minTwinkleSpeed,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkle,
        };
      });

      starsRef.current = stars;
    };

    const render = (time: number) => {
      const { clientWidth, clientHeight } = canvas;
      ctx.clearRect(0, 0, clientWidth, clientHeight);

      ctx.fillStyle = starColor;
      starsRef.current.forEach((star) => {
        const alpha = star.twinkle
          ? star.baseAlpha + Math.sin(time / 1000 * star.twinkleSpeed + star.twinklePhase) * 0.3
          : star.baseAlpha;

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      frameRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", resize);
    };
  }, [
    starDensity,
    allStarsTwinkle,
    twinkleProbability,
    minTwinkleSpeed,
    maxTwinkleSpeed,
    starColor,
  ]);

  return (
    <div className={className} {...props}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
