"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface DotGridProps {
  dotRadius?: number;
  spacing?: number;
  dotColor?: string;
  highlightRadius?: number;
}

export default function DotGrid({
  dotRadius = 1,
  spacing = 30,
  dotColor = "rgba(59, 124, 192, 0.04)",
  highlightRadius = 120,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const prefersReducedMotion = useReducedMotion();

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          const x = col * spacing;
          const y = row * spacing;

          let radius = dotRadius;
          let alpha = 0.07;

          if (mouse && !prefersReducedMotion) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < highlightRadius) {
              const factor = 1 - dist / highlightRadius;
              alpha = 0.07 + factor * 0.25;
              radius = dotRadius + factor * 1.5;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          if (mouse && !prefersReducedMotion && alpha > 0.07) {
            ctx.fillStyle = `rgba(59, 124, 192, ${alpha})`;
          } else {
            ctx.fillStyle = dotColor;
          }

          ctx.fill();
        }
      }
    },
    [dotRadius, spacing, dotColor, highlightRadius, prefersReducedMotion],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    if (!prefersReducedMotion) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    let paused = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        paused = true;
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      } else {
        paused = false;
        if (!prefersReducedMotion) {
          rafRef.current = requestAnimationFrame(loop);
        }
      }
    };

    const loop = () => {
      if (paused) return;
      draw(ctx, window.innerWidth, window.innerHeight);

      if (!prefersReducedMotion) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (prefersReducedMotion) {
      draw(ctx, window.innerWidth, window.innerHeight);
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [draw, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
