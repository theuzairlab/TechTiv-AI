import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "AI Discovery", href: "/discovery" },
      { label: "Pricing Engine", href: "/pricing" },
      { label: "Services", href: "/services" },
      { label: "Case Studies", href: "/case-studies" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Real Estate", href: "/industries/real-estate" },
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "Ecommerce", href: "/industries/ecommerce" },
      { label: "Law Firms", href: "/industries/law-firm" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-border-subtle bg-bg-primary">
      <div className="mx-auto max-w-7xl px-[5%] py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
              <span className="flex size-[34px] items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-accent-lime text-base font-bold text-on-accent">
                T
              </span>
              <span className="font-display text-xl font-bold tracking-[-0.5px] text-text-primary">
                Techtiv<em className="logo-accent not-italic">AI</em>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-text-muted">
              {siteConfig.description}
            </p>
            <Link
              href="/discovery"
              className="inline-flex h-9 items-center rounded-xl bg-accent-lime px-4 text-sm font-bold text-on-accent shadow-[0_0_20px_var(--shadow-lime)] transition-[box-shadow,transform,background] duration-200 hover:-translate-y-px hover:bg-accent-cyan hover:shadow-[0_0_32px_var(--shadow-cyan)]"
            >
              Start AI Discovery
            </Link>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 font-display text-sm font-bold text-text-primary">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors duration-200 link-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-text-muted transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
