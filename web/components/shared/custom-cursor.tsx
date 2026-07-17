"use client";

import { useEffect, useRef } from "react";

const interactiveSelector = "a, button, [data-cursor-target]";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let ringScale = 1;
    let frameId = 0;
    let running = true;
    let hoveredInteractive = false;

    const setCursorPos = (x: number, y: number) => {
      cursor.style.transform = `translate3d(${x - 5}px, ${y - 5}px, 0) scale(${hoveredInteractive ? 2 : 1})`;
    };

    const setInteractive = (active: boolean) => {
      if (hoveredInteractive === active) return;
      hoveredInteractive = active;
      ringScale = active ? 1.5 : 1;
      setCursorPos(mx, my);
    };

    const tick = () => {
      if (!running) return;

      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;

      if (Math.abs(mx - rx) < 0.4) rx = mx;
      if (Math.abs(my - ry) < 0.4) ry = my;

      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0) scale(${ringScale})`;
      frameId = window.requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      setCursorPos(mx, my);

      const target = event.target;
      const isInteractive =
        target instanceof Element &&
        Boolean(target.closest(interactiveSelector));
      setInteractive(isInteractive);

      if (rx < 0) {
        rx = mx;
        ry = my;
        ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0) scale(${ringScale})`;
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    frameId = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      document.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor-dot pointer-events-none fixed top-0 left-0 z-[9999] size-2.5 rounded-full will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
      <div
        ref={ringRef}
        className="custom-cursor-ring pointer-events-none fixed top-0 left-0 z-[9998] size-9 rounded-full border-2 will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
    </>
  );
}
