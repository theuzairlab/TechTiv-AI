"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks } from "@/lib/site";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-bg-primary/80 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col",
              "border-l border-glass-border bg-bg-secondary/95 p-6 backdrop-blur-2xl md:hidden",
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-lg font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-glass-border text-text-muted hover:text-text-primary"
              >
                <CloseIcon />
              </button>
            </div>

            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block rounded-xl px-4 py-3 text-base text-text-muted transition-colors nav-link hover:rounded-xl"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <div className="flex items-center justify-between rounded-xl border border-border-subtle px-4 py-3">
                <span className="text-sm text-text-muted">Theme</span>
                <ThemeToggle />
              </div>
              <Button href="/analyze" size="lg" onClick={onClose}>
                Analyze free →
              </Button>
              <Button
                href="/contact"
                variant="secondary"
                size="lg"
                onClick={onClose}
              >
                Talk To AI Consultant
              </Button>
            </div>
          </motion.nav>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
