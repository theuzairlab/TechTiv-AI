import { z } from "zod";

export const LEAD_SOURCES = [
  "contact_form",
  "discovery",
  "booking",
  "cta",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(255),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  interest: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  source: z.enum(LEAD_SOURCES),
  discoveryAnswers: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

export const updateLeadAdminSchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
  })
  .refine((data) => data.status !== undefined || data.notes !== undefined, {
    message: "Provide a status or notes update",
  });

export type UpdateLeadAdminInput = z.infer<typeof updateLeadAdminSchema>;

export const leadSourceLabels: Record<LeadSource, string> = {
  contact_form: "Contact form",
  discovery: "AI Discovery",
  booking: "Strategy booking",
  cta: "CTA",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal sent",
  WON: "Won",
  LOST: "Lost",
};

export function formatLeadInterest(interest?: string | null) {
  if (!interest) return "—";

  const labels: Record<string, string> = {
    proposal: "Custom proposal",
    consultation: "Consultation",
    pricing: "Pricing estimate",
    partnership: "Partnership",
    general: "General inquiry",
  };

  return labels[interest] ?? interest;
}
