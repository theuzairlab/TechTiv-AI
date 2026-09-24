import Link from "next/link";
import { siteConfig } from "@/lib/site";

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
      { label: "Analyze", href: "/analyze" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-border-subtle bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-[5%] sm:py-14 lg:py-16">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div className="space-y-4 sm:space-y-5">
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
              href="/analyze"
              className="inline-flex h-9 items-center rounded-xl bg-accent-lime px-4 text-sm font-bold text-on-accent shadow-[0_0_20px_var(--shadow-lime)] transition-[box-shadow,transform,background] duration-200 hover:-translate-y-px hover:bg-accent-cyan hover:shadow-[0_0_32px_var(--shadow-cyan)]"
            >
              Get My AI Blueprint
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:contents">
            {footerLinks.map((group) => (
              <div key={group.title} className="min-w-0">
                <h3 className="mb-3 font-display text-sm font-bold text-text-primary sm:mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-2.5 sm:space-y-3">
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
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border-subtle pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-8">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link
              href="/analyze"
              className="text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              Analyze
            </Link>
            <Link
              href="/pricing"
              className="text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              Contact
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
