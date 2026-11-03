"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, ShieldCheck, ArrowRight, LayoutDashboard, Compass } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-semibold tracking-tight text-foreground transition-transform active:scale-[0.98]"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/30 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Wrench className="size-4.5 transition-transform group-hover:rotate-12 duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                LendLoop
                <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-muted-foreground">
                Neighborhood Tool Board
              </span>
            </div>
          </Link>

          {/* Tagline Pill */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Borrow what you need. Lend what you don&apos;t.</span>
          </div>
        </div>

        {/* Navigation & Auth CTA */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 text-xs font-medium active:scale-[0.98]"
              >
                <Compass className="size-3.5" />
                <span className="hidden sm:inline">Catalog</span>
              </Button>
            </Link>

            {isSignedIn && (
              <Link href="/dashboard">
                <Button
                  variant={pathname.startsWith("/dashboard") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5 text-xs font-medium active:scale-[0.98]"
                >
                  <LayoutDashboard className="size-3.5" />
                  <span>Dashboard</span>
                </Button>
              </Link>
            )}
          </nav>

          {/* User state / Sign in button */}
          {!isLoaded ? (
            <div className="size-8 rounded-full bg-muted animate-pulse" />
          ) : isSignedIn ? (
            <div className="flex items-center gap-3 pl-2 border-l border-border/60">
              {currentUser?.role === "admin" && (
                <Badge
                  variant="outline"
                  className="hidden sm:flex border-primary/40 bg-primary/10 text-primary font-mono text-[10px] tracking-wide uppercase px-2 py-0.5"
                >
                  Admin
                </Badge>
              )}
              {currentUser?.isTrustedLender && (
                <Badge
                  variant="outline"
                  className="hidden sm:flex border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] items-center gap-1 px-2 py-0.5"
                >
                  <ShieldCheck className="size-3" />
                  Trusted Lender
                </Badge>
              )}
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "size-8 ring-2 ring-border hover:ring-primary/50 transition-all",
                  },
                }}
              />
            </div>
          ) : (
            <SignInButton forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
              <Button
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs px-3.5 shadow-sm active:scale-[0.98] transition-transform"
              >
                <span>Sign in to lend or borrow</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
