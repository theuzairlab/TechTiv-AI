"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { AUTH_ROUTES } from "@/lib/auth-routes";
import { getHomeRouteForRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthFormsProps = {
  mode: "login" | "register";
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthForms({ mode }: AuthFormsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");

  const signInCallbackUrl =
    rawCallback && rawCallback !== AUTH_ROUTES.defaultCallback
      ? rawCallback
      : AUTH_ROUTES.redirect;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicEmail, setMagicEmail] = useState(
    () => searchParams.get("email")?.trim() ?? "",
  );
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const isLogin = mode === "login";

  const title = useMemo(
    () => (isLogin ? "Welcome back" : "Create your account"),
    [isLogin],
  );

  const subtitle = useMemo(
    () =>
      isLogin
        ? "Sign in with a magic link, password, or Google."
        : "Register with a username and secure password.",
    [isLogin],
  );

  const resolveRedirect = async () => {
    const { data } = await authClient.getSession();
    const hasExplicitCallback =
      rawCallback !== null && rawCallback !== AUTH_ROUTES.defaultCallback;

    if (hasExplicitCallback && rawCallback) {
      return rawCallback;
    }

    return getHomeRouteForRole(
      (data?.user as { role?: string } | undefined)?.role,
    );
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: signInCallbackUrl,
      });
    } catch {
      setError("Google sign-in failed. Check OAuth credentials in your environment.");
      setGoogleLoading(false);
    }
  };

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMagicSent(false);

    const email = magicEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      setError("Enter a valid email for the magic link.");
      return;
    }

    setMagicLoading(true);
    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: signInCallbackUrl,
      });

      if (result.error) {
        setError(result.error.message ?? "Could not send magic link.");
        return;
      }

      setMagicSent(true);
    } catch {
      setError("Could not send magic link. Please try again.");
    } finally {
      setMagicLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const trimmed = identifier.trim();
        const result = trimmed.includes("@")
          ? await authClient.signIn.email({
              email: trimmed,
              password,
              callbackURL: signInCallbackUrl,
            })
          : await authClient.signIn.username({
              username: trimmed,
              password,
              callbackURL: signInCallbackUrl,
            });

        if (result.error) {
          setError(result.error.message ?? "Invalid credentials.");
          return;
        }
      } else {
        if (!username.trim()) {
          setError("Username is required.");
          return;
        }

        const result = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
          username: username.trim(),
          callbackURL: signInCallbackUrl,
        });

        if (result.error) {
          setError(result.error.message ?? "Could not create account.");
          return;
        }
      }

      const destination = await resolveRedirect();
      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="mb-5 w-full"
        disabled={googleLoading || loading || magicLoading}
        onClick={handleGoogleSignIn}
      >
        {googleLoading ? (
          <Loader2 size={18} className="mr-2 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 size-4" />
        )}
        Continue with Google
      </Button>

      {isLogin ? (
        <>
          <form onSubmit={handleMagicLink} className="mb-5 space-y-3">
            <Input
              label="Email magic link"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              value={magicEmail}
              onChange={(e) => {
                setMagicEmail(e.target.value);
                setMagicSent(false);
              }}
              hint="We'll email a one-time sign-in link — no password needed"
            />
            {magicSent ? (
              <p
                role="status"
                className="rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-2 text-sm text-text-primary"
              >
                Check your inbox for the sign-in link.
              </p>
            ) : null}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={magicLoading || loading || googleLoading}
            >
              {magicLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Sending link…
                </>
              ) : (
                "Email me a magic link"
              )}
            </Button>
          </form>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border-subtle" />
            </div>
            <p className="relative mx-auto w-fit bg-transparent px-3 text-xs text-text-muted">
              or use password
            </p>
          </div>
        </>
      ) : (
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-subtle" />
          </div>
          <p className="relative mx-auto w-fit bg-transparent px-3 text-xs text-text-muted">
            or continue with email
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin ? (
          <>
            <Input
              label="Full name"
              placeholder="Jane Smith"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Username"
              placeholder="janesmith"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              hint="Letters, numbers, and underscores only"
            />
            <Input
              label="Email"
              type="email"
              placeholder="jane@company.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        ) : (
          <Input
            label="Email or username"
            placeholder="you@company.com or username"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        )}

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Minimum 8 characters"
        />

        {!isLogin ? (
          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        ) : null}

        {error ? (
          <p
            role="alert"
            className={cn(
              "rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-3 py-2 text-sm text-accent-rose",
            )}
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading || googleLoading}>
          {loading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              {isLogin ? "Signing in…" : "Creating account…"}
            </>
          ) : isLogin ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </div>
  );
}
