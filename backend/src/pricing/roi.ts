export type RoiResult =
  | {
      available: false;
      missingInputs: string[];
      note: string;
    }
  | {
      available: true;
      currency: "USD";
      assumptions: Record<string, number>;
      scenarios: {
        conservative: { annualBenefitUSD: number; paybackMonths: number };
        base: { annualBenefitUSD: number; paybackMonths: number };
        upside: { annualBenefitUSD: number; paybackMonths: number };
      };
    };

function number(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const match = value.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

export function calculateRoi(
  intake: Record<string, unknown>,
  investmentUSD: number,
): RoiResult {
  const inputs = {
    monthlyVolume: number(intake.monthlyVolume ?? intake.volumes),
    minutesPerItem: number(intake.minutesPerItem),
    hourlyCostUSD: number(intake.hourlyCostUSD),
    automatablePercent: number(intake.automatablePercent),
  };
  const missingInputs = Object.entries(inputs)
    .filter(([, value]) => !value || value <= 0)
    .map(([key]) => key);
  if (missingInputs.length) {
    return {
      available: false,
      missingInputs,
      note: "ROI is withheld until measured operating inputs are confirmed.",
    };
  }

  const monthlyHours =
    (inputs.monthlyVolume! * inputs.minutesPerItem!) / 60;
  const annualBaseline = monthlyHours * inputs.hourlyCostUSD! * 12;
  const baseRate = Math.min(inputs.automatablePercent! / 100, 0.9);
  const scenario = (rateFactor: number) => {
    const annualBenefitUSD = Math.round(annualBaseline * baseRate * rateFactor);
    return {
      annualBenefitUSD,
      paybackMonths:
        annualBenefitUSD > 0
          ? Number(((investmentUSD / annualBenefitUSD) * 12).toFixed(1))
          : 0,
    };
  };
  return {
    available: true,
    currency: "USD",
    assumptions: inputs as Record<string, number>,
    scenarios: {
      conservative: scenario(0.65),
      base: scenario(1),
      upside: scenario(1.25),
    },
  };
}
