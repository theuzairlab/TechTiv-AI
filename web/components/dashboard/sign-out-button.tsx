"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AUTH_ROUTES } from "@/lib/auth-routes";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push(AUTH_ROUTES.login);
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleSignOut}
    >
      <LogOut size={14} className="mr-1.5" />
      Sign out
    </Button>
  );
}
