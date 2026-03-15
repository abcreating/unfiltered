"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  ScrollText,
  ChevronLeft,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/speeches", label: "Speeches", icon: FileText },
  { href: "/admin/leaders", label: "Leaders", icon: Users },
  { href: "/admin/ingestion", label: "Ingestion Log", icon: ScrollText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-card/50 flex flex-col">
        {/* Sidebar header */}
        <div className="px-4 py-5 border-b border-border/60">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-3"
          >
            <ChevronLeft className="size-3" />
            Back to site
          </Link>
          <h1 className="heading-serif text-lg tracking-wide">
            Admin
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <link.icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin access notice */}
        <div className="px-4 py-4 border-t border-border/60">
          <p className="text-xs text-muted-foreground/60">
            Admin access required
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
