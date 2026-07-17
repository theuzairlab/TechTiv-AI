"use client";

import { useEffect, useRef } from "react";
import type { Theme } from "@/lib/theme";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

function getNeuralColors(isLight: boolean) {
  return {
    node: isLight ? "rgba(0, 110, 138, 0.75)" : "rgba(198, 255, 0, 0.8)",
    lineBase: isLight ? 0.28 : 0.25,
  };
}

export function LandingNeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frameId = 0;
    let isLight = document.body.classList.contains("light-mode");
    let colors = getNeuralColors(isLight);

    const nodes: Node[] = Array.from({ length: 60 }, () => ({
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.5 + Math.random() * 2,
    }));

    const onThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      isLight = detail === "light";
      colors = getNeuralColors(isLight);
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      nodes.forEach((node) => {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = colors.node;
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 160) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(61,232,255,${colors.lineBase * (1 - distance / 160)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("techtiv-theme-change", onThemeChange);
    frameId = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("techtiv-theme-change", onThemeChange);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="neural"
      className="pointer-events-none fixed inset-0 z-0 opacity-50"
    />
  );
}
