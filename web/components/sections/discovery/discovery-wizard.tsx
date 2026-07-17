"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { DiscoveryOption } from "@/components/sections/discovery/discovery-option";
import { DiscoveryProgress } from "@/components/sections/discovery/discovery-progress";
import { DiscoveryResults } from "@/components/sections/discovery/discovery-results";
import { cn } from "@/lib/utils";
import {
  businessProblems,
  businessSizes,
  businessTools,
  businessTypes,
  calculateDiscoveryResult,
  discoverySteps,
  emptyDiscoveryAnswers,
  type BusinessSizeId,
  type BusinessTypeId,
  type DiscoveryAnswers,
  type ProblemId,
  type ToolId,
} from "@/lib/discovery";

const stepLabels = ["Industry", "Team Size", "Problems", "Tools"];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

type DiscoveryWizardProps = {
  onStepChange?: (step: number, showResults: boolean) => void;
  className?: string;
};

export function DiscoveryWizard({ onStepChange, className }: DiscoveryWizardProps = {}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<DiscoveryAnswers>(emptyDiscoveryAnswers);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    onStepChange?.(step, showResults);
  }, [step, showResults, onStepChange]);

  const result = useMemo(
    () => calculateDiscoveryResult(answers),
    [answers],
  );

  const currentStep = discoverySteps[step];

  const canContinue = useMemo(() => {
    if (showResults) return false;

    switch (currentStep?.id) {
      case "businessType":
        return answers.businessType !== null;
      case "businessSize":
        return answers.businessSize !== null;
      case "problems":
        return answers.problems.length > 0;
      case "tools":
        return true;
      default:
        return false;
    }
  }, [answers, currentStep?.id, showResults]);

  const goNext = () => {
    if (!canContinue) return;

    if (step === discoverySteps.length - 1) {
      setShowResults(true);
      return;
    }

    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (showResults) {
      setShowResults(false);
      return;
    }

    if (step === 0) return;
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const restart = () => {
    setAnswers(emptyDiscoveryAnswers);
    setStep(0);
    setDirection(-1);
    setShowResults(false);
  };

  const toggleProblem = (id: ProblemId) => {
    setAnswers((prev) => ({
      ...prev,
      problems: prev.problems.includes(id)
        ? prev.problems.filter((item) => item !== id)
        : [...prev.problems, id],
    }));
  };

  const toggleTool = (id: ToolId) => {
    setAnswers((prev) => ({
      ...prev,
      tools: prev.tools.includes(id)
        ? prev.tools.filter((item) => item !== id)
        : [...prev.tools, id],
    }));
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case "businessType":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {businessTypes.map((type) => (
              <DiscoveryOption
                key={type.id}
                label={type.label}
                icon={type.icon}
                selected={answers.businessType === type.id}
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    businessType: type.id as BusinessTypeId,
                  }))
                }
              />
            ))}
          </div>
        );

      case "businessSize":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {businessSizes.map((size) => (
              <DiscoveryOption
                key={size.id}
                label={size.label}
                description={size.description}
                selected={answers.businessSize === size.id}
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    businessSize: size.id as BusinessSizeId,
                  }))
                }
              />
            ))}
          </div>
        );

      case "problems":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {businessProblems.map((problem) => (
              <DiscoveryOption
                key={problem.id}
                label={problem.label}
                selected={answers.problems.includes(problem.id)}
                onClick={() => toggleProblem(problem.id)}
              />
            ))}
          </div>
        );

      case "tools":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {businessTools.map((tool) => (
              <DiscoveryOption
                key={tool.id}
                label={tool.label}
                selected={answers.tools.includes(tool.id)}
                onClick={() => toggleTool(tool.id)}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <GlassPanel variant="elevated" className={cn("overflow-hidden", className)}>
      <div className="border-b border-glass-border p-5 sm:p-8">
        {!showResults ? (
          <DiscoveryProgress
            currentStep={step}
            totalSteps={discoverySteps.length}
            labels={stepLabels}
          />
        ) : null}
      </div>

      <div className="p-5 sm:p-8">
        <AnimatePresence mode="wait" custom={direction}>
          {showResults && result ? (
            <DiscoveryResults
              key="results"
              result={result}
              answers={answers}
              onRestart={restart}
            />
          ) : (
            <motion.div
              key={currentStep?.id}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  {currentStep?.title}
                </h3>
                <p className="text-sm text-text-muted sm:text-base">
                  {currentStep?.subtitle}
                </p>
              </div>

              {renderStepContent()}

              <div className="flex flex-col-reverse gap-3 border-t border-glass-border pt-6 sm:flex-row sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={goBack}
                  disabled={step === 0 && !showResults}
                >
                  Back
                </Button>
                <Button onClick={goNext} disabled={!canContinue}>
                  {step === discoverySteps.length - 1
                    ? "Generate Recommendations"
                    : "Continue"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
