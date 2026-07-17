import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(500)
  .optional()
  .or(z.literal(""));

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""));

export const socialLinksSchema = z
  .object({
    website: optionalUrl,
    facebook: optionalUrl,
    instagram: optionalUrl,
    linkedin: optionalUrl,
    twitter: optionalUrl,
    tiktok: optionalUrl,
    youtube: optionalUrl,
  })
  .optional();

export const businessLocationSchema = z
  .object({
    city: optionalText,
    region: optionalText,
    country: optionalText,
  })
  .optional();

export const businessIntakeSchema = z.object({
  companyName: optionalText,
  industry: optionalText,
  location: businessLocationSchema,
  goals: z.array(z.string().trim().min(1).max(200)).max(8).optional(),
  teamSize: optionalText,
  revenueRange: optionalText,
  additionalNotes: z.string().trim().max(2000).optional().or(z.literal("")),
  socialLinks: socialLinksSchema,
});

export const createAnalysisSchema = z
  .object({
    domain: z.string().trim().max(255).optional().or(z.literal("")),
    email: z.string().trim().email("Valid email is required").max(255).optional().or(z.literal("")),
    name: z.string().trim().min(1).max(120).optional().or(z.literal("")),
    company: z.string().trim().max(120).optional().or(z.literal("")),
    socialLinks: socialLinksSchema,
    businessIntake: businessIntakeSchema.optional(),
    discoveryAnswers: z.record(z.string(), z.unknown()).optional(),
    notifyIfInProgress: z.boolean().optional(),
    guestAccessToken: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const domain = data.domain?.trim() ?? "";
    const website = data.businessIntake?.socialLinks?.website?.trim() ?? "";
    const socials = data.businessIntake?.socialLinks ?? data.socialLinks ?? {};
    const hasSocial = Object.values(socials).some((value) => Boolean(value?.trim()));
    const company =
      data.company?.trim() ||
      data.businessIntake?.companyName?.trim() ||
      "";

    if (!domain && !website && !hasSocial) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a website domain or at least one social profile URL",
        path: ["domain"],
      });
    }

    if (!domain && !website && hasSocial && !company) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required when submitting social profiles without a website",
        path: ["businessIntake", "companyName"],
      });
    }
  });

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
export type BusinessIntake = z.infer<typeof businessIntakeSchema>;

export const captureEmailSchema = z.object({
  email: z.string().trim().email("Valid email is required").max(255),
  name: z.string().trim().min(1).max(120).optional().or(z.literal("")),
  guestAccessToken: z.string().uuid(),
});

export type CaptureEmailInput = z.infer<typeof captureEmailSchema>;
