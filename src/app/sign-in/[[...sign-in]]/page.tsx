import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <SignIn
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
