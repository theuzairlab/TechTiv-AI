"use client";

import { LandingChatWidget } from "@/components/landing/landing-chat-widget";
import { LandingChromeToggle } from "@/components/landing/landing-chrome-toggle";
import { LandingNeuralCanvas } from "@/components/landing/landing-neural-canvas";
import { LandingPageView } from "@/components/landing/landing-page-view";
import { LandingScrollReveal } from "@/components/landing/landing-scroll-reveal";

export function LandingPage() {
  return (
    <div className="scroll-smooth bg-bg-primary font-body text-base text-text-body overflow-x-hidden">
      <LandingChromeToggle />
      <LandingNeuralCanvas />
      <LandingScrollReveal />
      <LandingPageView />
      <LandingChatWidget />
    </div>
  );
}
