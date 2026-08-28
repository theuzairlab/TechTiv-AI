import { z } from "zod";

const evidenceRefs = z.array(z.string().min(1)).min(1).max(8);
const level = z.enum(["high", "medium", "low"]);

export const synthesisSchema = z.object({
  businessProfile: z.object({
    summary: z.string().min(1),
    industry: z.string().min(1),
    teamSize: z.enum(["solo", "small", "medium", "large", "unknown"]),
    operatingModel: z.string().min(1),
  }),
  executiveSummary: z.string().min(1),
  scorecard: z
    .array(
      z.object({
        dimension: z.string().min(1),
        score: z.number().int().min(0).max(100),
        rationale: z.string().min(1),
        evidenceRefs,
      }),
    )
    .min(3)
    .max(8),
  findings: z
    .array(
      z.object({
        title: z.string().min(1),
        category: z.enum([
          "operations",
          "sales",
          "marketing",
          "customer_experience",
          "technology",
          "seo",
          "local_visibility",
          "answer_readiness",
          "trust",
        ]),
        severity: level,
        summary: z.string().min(1),
        evidenceRefs,
      }),
    )
    .min(2)
    .max(10),
  competitors: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.string().url().optional(),
        positioning: z.string().min(1),
        verified: z.boolean(),
        evidenceRefs,
      }),
    )
    .max(6),
  opportunities: z
    .array(
      z.object({
        title: z.string().min(1),
        outcome: z.string().min(1),
        workflow: z.string().min(1),
        impact: level,
        effort: level,
        integrations: z.array(z.string()).max(8),
        evidenceRefs,
      }),
    )
    .min(1)
    .max(8),
  stackArchitecture: z
    .array(
      z.object({
        layer: z.string().min(1),
        recommendation: z.string().min(1),
        reason: z.string().min(1),
        evidenceRefs: z.array(z.string()).max(8),
      }),
    )
    .max(8),
  roadmap: z
    .array(
      z.object({
        phase: z.string().min(1),
        objective: z.string().min(1),
        deliverables: z.array(z.string().min(1)).min(1).max(8),
        dependencies: z.array(z.string()).max(8),
        estimatedWeeks: z.number().int().min(1).max(24),
      }),
    )
    .min(1)
    .max(5),
  risks: z.array(z.string().min(1)).max(8),
  assumptions: z.array(z.string().min(1)).max(8),
  unknowns: z.array(z.string().min(1)).max(8),
  confidence: z.object({
    level,
    rationale: z.string().min(1),
  }),
});

export type SynthesisResult = z.infer<typeof synthesisSchema>;

export const synthesisJsonSchemaForPrompt = `{
  "businessProfile":{"summary":"string","industry":"string","teamSize":"solo|small|medium|large|unknown","operatingModel":"string"},
  "executiveSummary":"string",
  "scorecard":[{"dimension":"string","score":0,"rationale":"string","evidenceRefs":["evidence-key"]}],
  "findings":[{"title":"string","category":"operations|sales|marketing|customer_experience|technology|seo|local_visibility|answer_readiness|trust","severity":"high|medium|low","summary":"string","evidenceRefs":["evidence-key"]}],
  "competitors":[{"name":"string","url":"https://... optional","positioning":"string","verified":true,"evidenceRefs":["evidence-key"]}],
  "opportunities":[{"title":"string","outcome":"string","workflow":"string","impact":"high|medium|low","effort":"high|medium|low","integrations":["string"],"evidenceRefs":["evidence-key"]}],
  "stackArchitecture":[{"layer":"string","recommendation":"string","reason":"string","evidenceRefs":["evidence-key"]}],
  "roadmap":[{"phase":"string","objective":"string","deliverables":["string"],"dependencies":["string"],"estimatedWeeks":1}],
  "risks":["string"],"assumptions":["string"],"unknowns":["string"],
  "confidence":{"level":"high|medium|low","rationale":"string"}
}`;
