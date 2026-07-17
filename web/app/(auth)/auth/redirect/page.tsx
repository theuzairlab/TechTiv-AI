import { redirect } from "next/navigation";
import { resolvePostLoginRedirect } from "@/lib/session";

type AuthRedirectPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function AuthRedirectPage({ searchParams }: AuthRedirectPageProps) {
  const params = await searchParams;
  const destination = await resolvePostLoginRedirect(params.callbackUrl);
  redirect(destination);
}
