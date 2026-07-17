import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/animations/section-wrapper";
import { VoiceConsultantUI } from "@/components/sections/voice/voice-consultant-ui";

export function VoiceSection() {
  return (
    <SectionWrapper id="voice" className="bg-grid">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <Badge variant="cyan">AI Voice Consultant</Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            AI Voice{" "}
            <span className="text-gradient-cyan">Consultant</span>
          </h2>
          <p className="text-base leading-relaxed text-text-muted sm:text-lg">
            Talk to a futuristic AI consultant — get business analysis, workflow
            recommendations, pricing estimates, and meeting scheduling in a
            natural voice conversation.
          </p>
        </div>
        <Button href="/contact" variant="secondary" className="shrink-0 self-start lg:self-auto">
          Book Live Consultation
        </Button>
      </div>

      <VoiceConsultantUI />
    </SectionWrapper>
  );
}
