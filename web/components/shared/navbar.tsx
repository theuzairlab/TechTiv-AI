"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { navLinks, siteConfig } from "@/lib/site";
import { MobileMenu } from "@/components/shared/mobile-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[68px] border-b border-border-subtle transition-all duration-300",
          "bg-nav-bg backdrop-blur-3xl backdrop-saturate-[180%]",
          scrolled && "shadow-[0_2px_20px_var(--shadow-cyan)]",
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-[5%]">
          <Link href="/" className="group flex items-center gap-2.5 no-underline">
            <span className="flex size-[34px] items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-lime text-base font-bold text-on-accent">
              T
            </span>
            <span className="font-display text-xl font-bold tracking-[-0.5px] text-text-primary">
              Techtiv<em className="logo-accent not-italic">AI</em>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link rounded-md px-3.5 py-[7px] text-[0.85rem] font-medium text-text-muted no-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-[7px] text-xs text-text-muted">
              <div className="ui-dot size-[7px] animate-status-blink rounded-full" />
              All Systems Live
            </div>
            <ThemeToggle />
            <Link
              href="/analyze"
              className="rounded-[7px] bg-accent-lime px-5 py-[9px] text-[0.82rem] font-bold text-on-accent no-underline shadow-[0_0_20px_var(--shadow-lime)] transition-[box-shadow,transform,background] duration-200 hover:-translate-y-px hover:bg-accent-cyan hover:shadow-[0_0_32px_var(--shadow-cyan)]"
            >
              Analyze free →
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-text-primary"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="h-[68px] shrink-0" aria-hidden />

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
