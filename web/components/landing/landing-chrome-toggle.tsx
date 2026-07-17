"use client";

import { useEffect } from "react";

export function LandingChromeToggle() {
  useEffect(() => {
    document.body.dataset.landingPage = "true";
    return () => {
      delete document.body.dataset.landingPage;
    };
  }, []);

  return null;
}
