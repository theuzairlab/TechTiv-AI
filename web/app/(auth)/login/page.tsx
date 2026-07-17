import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to the TechTivAI admin dashboard.",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialTab = params.tab === "register" ? "register" : "login";

  return <AuthPanel initialTab={initialTab} />;
}
