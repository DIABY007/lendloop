"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInButton, useUser } from "@clerk/nextjs";
import { CATEGORIES, ToolCategory } from "@/lib/constants";
import {
  Wrench,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  Layers,
  Sparkles,
  Inbox,
} from "lucide-react";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const availableTools = useQuery(api.tools.listAvailableTools);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");

  const filteredTools = availableTools?.filter((tool) => {
    if (selectedCategory === "all") return true;
    return tool.category === selectedCategory;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1">
        {/* ================================================================= */}
        {/* HERO SECTION — "Atelier Brutalism & Precision Craft"              */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden border-b border-border/70 py-16 sm:py-24 bg-gradient-to-b from-card/60 via-background to-background">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-primary/10 blur-[120px]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-medium text-primary mb-6">
                <Sparkles className="size-3.5" />
                <span>Zero-waste local equipment exchange</span>
              </div>

              {/* Tagline & Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
                Borrow what you need. <br />
                <span className="text-primary underline decoration-primary/40 decoration-wavy decoration-1 underline-offset-8">
                  Lend what you don&apos;t.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground font-normal max-w-2xl mx-auto">
                LendLoop is your neighborhood equipment board. Access high-grade tools, camping gear, and kitchenware without buying them, with automated reminders powered by n8n.
              </p>

              {/* Hero CTAs */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 shadow-md active:scale-[0.98] transition-transform"
                    >
                      <span>Open Your Dashboard</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                ) : (
                  <SignInButton forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
                    <Button
                      size="lg"
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 shadow-md active:scale-[0.98] transition-transform"
                    >
                      <span>Sign in to lend or borrow</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </SignInButton>
                )}

                <a href="#catalog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-border/80 font-medium px-5 active:scale-[0.98]"
                  >
                    <Layers className="size-4 text-muted-foreground" />
                    <span>Browse Public Catalog</span>
                  </Button>
                </a>
              </div>

              {/* Trust & Privacy Pillars */}
              <div className="mt-12 border-t border-border/60 pt-8 text-left">
                <h2 className="sr-only">Core Platform Guarantees</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-card/40 p-3.5">
                    <Lock className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">Data Minimization</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        No personal or contact info exposed in public listings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-card/40 p-3.5">
                    <Zap className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">n8n Automation</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cryptographic HMAC webhooks & automated return reminders.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-card/40 p-3.5">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">Trusted Lenders</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Peer-vetted equipment badges and verified neighbor accounts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* PUBLIC CATALOG SECTION (Read-only, name + category only)          */}
        {/* ================================================================= */}
        <section id="catalog" className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                  <Wrench className="size-3.5" />
                  <span>Equipment Registry</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Available Tools in the Neighborhood
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                  Showing live equipment available to borrow. Sign in with Clerk to request a booking or list your own tools.
                </p>
              </div>

              {/* Data Minimization Tag */}
              <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground font-mono shrink-0">
                <Lock className="size-3 text-primary/70" />
                <span>Public Mode: Owner identity shielded</span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="h-8 text-xs font-medium rounded-full active:scale-[0.98]"
              >
                All Tools
                {availableTools && (
                  <span className="ml-1.5 text-xs font-mono opacity-80 tabular-nums">
                    ({availableTools.length})
                  </span>
                )}
              </Button>

              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="h-8 text-xs font-medium rounded-full active:scale-[0.98] shrink-0"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Tool Grid / Loading Skeletons / Empty State */}
            {availableTools === undefined ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : filteredTools && filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool._id}
                    id={tool._id}
                    name={tool.name}
                    category={tool.category}
                    condition={tool.condition}
                    isAvailable={tool.isAvailable}
                    isPublicView={true}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted border border-border mb-4">
                  <Inbox className="size-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  No tools listed in this category yet
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Be the first neighbor to list gear in this category and earn community trust.
                </p>
                <div className="mt-5">
                  {isSignedIn ? (
                    <Link href="/dashboard">
                      <Button size="sm" className="bg-primary text-primary-foreground text-xs">
                        List an equipment
                      </Button>
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <Button size="sm" className="bg-primary text-primary-foreground text-xs">
                        Sign in to list a tool
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-card/60 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-foreground">LendLoop</span>
            <span>—</span>
            <span>Neighborhood Tool Lending & Automated Workflows</span>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            Convex · Clerk · n8n Engine · Next.js 16
          </div>
        </div>
      </footer>
    </div>
  );
}
