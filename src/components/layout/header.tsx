import Link from "next/link";

const navLinks = [
  { href: "/speeches", label: "Speeches" },
  { href: "/leaders", label: "Leaders" },
  { href: "/find", label: "Find the Clip" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="w-full">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="heading-serif text-lg tracking-[0.2em] uppercase">
          Unfiltered
        </Link>
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="rule-stone" />
    </header>
  );
}
