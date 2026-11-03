import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 text-center">
          <Link
            href="/"
            className="group flex flex-col items-center gap-3 transition-transform active:scale-[0.98]"
          >
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-card border border-primary/30 p-2 shadow-lg shadow-primary/5 ring-1 ring-primary/20 transition-all group-hover:border-primary/50">
              <Image
                src="/Logo.png"
                alt="LendLoop logo"
                width={56}
                height={56}
                className="size-10 object-contain drop-shadow transition-transform group-hover:scale-105 duration-200"
                priority
              />
            </div>
            <div className="text-center">
              <span className="text-xl font-bold tracking-tight text-foreground block">
                LendLoop
              </span>
              <span className="text-xs text-muted-foreground block mt-0.5">
                Neighborhood Tool Lending Board
              </span>
            </div>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="w-full h-96 rounded-xl border border-border bg-card p-6 flex flex-col justify-center space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          }
        >
          <SignUp
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                card: "bg-card border border-border shadow-xl rounded-xl",
                headerTitle: "text-foreground font-semibold text-xl",
                headerSubtitle: "text-muted-foreground text-sm",
                formButtonPrimary:
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium",
                footerActionLink: "text-primary hover:underline",
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
