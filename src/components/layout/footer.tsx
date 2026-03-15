import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/submit", label: "Submit a Speech" },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full">
      <div className="rule-stone" />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-sm text-muted-foreground max-w-lg">
          Unfiltered is a non-partisan archive of full-text transcripts.
        </p>
        <nav className="flex items-center gap-6 mt-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm link-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground/60 mt-8">
          No editorial spin. No algorithms. No ads.
        </p>
      </div>
    </footer>
  );
}
