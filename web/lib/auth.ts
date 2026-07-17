import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink, username } from "better-auth/plugins";
import { sendAnalysisReadyEmail, sendMagicLinkEmail } from "@/lib/email/send";
import { linkLeadsToUser } from "@/lib/leads/link-user";
import { prisma } from "@/lib/prisma";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

type MagicLinkMetadata = {
  kind?: string;
  analysisId?: string;
  domain?: string;
  costEstimateUSD?: number | null;
  timelineWeeks?: number | null;
  recipientName?: string;
};

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await linkLeadsToUser(user.email, user.id);
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true },
          });
          if (user?.email) {
            await linkLeadsToUser(user.email, session.userId);
          }
        },
      },
    },
  },
  plugins: [
    username(),
    magicLink({
      expiresIn: 60 * 60,
      sendMagicLink: async ({ email, url, metadata }) => {
        const meta = (metadata ?? {}) as MagicLinkMetadata;

        if (meta.kind === "analysis_ready" && meta.analysisId && meta.domain) {
          await sendAnalysisReadyEmail({
            to: email,
            name: meta.recipientName?.trim() || "there",
            domain: meta.domain,
            analysisId: meta.analysisId,
            magicLinkUrl: url,
            costEstimateUSD: meta.costEstimateUSD,
            timelineWeeks: meta.timelineWeeks,
          });
          return;
        }

        await sendMagicLinkEmail({
          to: email,
          magicLinkUrl: url,
        });
      },
    }),
    nextCookies(),
  ],
  trustedOrigins: [baseURL],
});

export type Session = typeof auth.$Infer.Session;
