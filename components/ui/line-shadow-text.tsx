"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type LineShadowTextProps = {
  children: string;
  shadowColor?: string;
  as?: React.ElementType;
  className?: string;
};

export function LineShadowText({
  children,
  shadowColor = "black",
  as: Component = "span",
  className,
}: LineShadowTextProps) {
  return (
    <Component
      className={cn(
        "relative inline-block",
        className
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 -z-10 translate-x-[3px] translate-y-[3px] select-none"
        style={
          {
            color: shadowColor,
            filter: "blur(2px)",
            opacity: 0.35,
            animation: "line-shadow-move 3.6s ease-in-out infinite",
          } as React.CSSProperties
        }
      >
        {children}
      </span>
      {children}
      <style>{`
        @keyframes line-shadow-move {
          0%, 100% {
            transform: translate(3px, 3px);
          }
          50% {
            transform: translate(1px, 5px);
          }
        }
      `}</style>
    </Component>
  );
}
