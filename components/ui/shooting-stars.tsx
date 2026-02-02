"use client";

import React, { useEffect, useRef } from "react";

export type ShootingStarsProps = React.ComponentProps<"div"> & {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
};

type Star = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
};

export function ShootingStars({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 4200,
  maxDelay = 8700,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
  ...props
}: ShootingStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<number | undefined>(undefined);

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
    };

    const spawnStar = () => {
      const { clientWidth, clientHeight } = canvas;
      const speed =
        Math.random() * (maxSpeed - minSpeed) + minSpeed;
      const startX = Math.random() * clientWidth * 0.8 + clientWidth * 0.2;
      const startY = Math.random() * clientHeight * 0.4;
      const angle = Math.random() * Math.PI / 4 + Math.PI * 1.1;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const length = Math.random() * 120 + 80;
      const maxLife = Math.random() * 60 + 40;

      starsRef.current.push({
        x: startX,
        y: startY,
        vx,
        vy,
        length,
        life: 0,
        maxLife,
      });

      const delay =
        Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutRef.current = window.setTimeout(spawnStar, delay);
    };

    const render = () => {
      const { clientWidth, clientHeight } = canvas;
      ctx.clearRect(0, 0, clientWidth, clientHeight);

      starsRef.current = starsRef.current.filter((star) => {
        star.x += star.vx * 0.5;
        star.y += star.vy * 0.5;
        star.life += 1;

        const progress = 1 - star.life / star.maxLife;
        const alpha = Math.max(0, progress);

        ctx.save();
        ctx.globalAlpha = alpha;
        const gradient = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x + star.vx * 2,
          star.y + star.vy * 2
        );
        gradient.addColorStop(0, trailColor);
        gradient.addColorStop(1, starColor);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = starHeight;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - star.vx * (star.length / 20),
          star.y - star.vy * (star.length / 20)
        );
        ctx.stroke();

        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(star.x, star.y, starWidth / 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return star.life < star.maxLife;
      });

      frameRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    spawnStar();
    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener("resize", resize);
    };
  }, [
    minSpeed,
    maxSpeed,
    minDelay,
    maxDelay,
    starColor,
    trailColor,
    starWidth,
    starHeight,
  ]);

  return (
    <div className={className} {...props}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
