import { z } from "zod";

export const startConsultationSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  links: z.string().trim().min(3).max(1000),
  additionalInfo: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const replyConsultationSchema = z.object({
  guestAccessToken: z.string().uuid(),
  field: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(2000),
});

export const consultationAccessSchema = z.object({
  guestAccessToken: z.string().uuid(),
});
