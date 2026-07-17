"use client";

import { useEffect, useState } from "react";
import { CustomCursor } from "@/components/shared/custom-cursor";

export function PagesChrome({ children }: { children: React.ReactNode }) {
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");

    const apply = (matches: boolean) => {
      setFinePointer(matches);
      document.body.classList.toggle("cursor-none", matches);
    };

    apply(media.matches);

    const onChange = (event: MediaQueryListEvent) => apply(event.matches);
    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
      document.body.classList.remove("cursor-none");
    };
  }, []);

  return (
    <>
      {finePointer ? <CustomCursor /> : null}
      {children}
    </>
  );
}
