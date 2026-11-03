"use client";

import { ReactNode, useEffect } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy-dev-url.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Silence harmless browser extension attributes (e.g. Bitwarden bis_skin_checked / bis_register)
    if (typeof window !== "undefined") {
      const originalError = console.error;
      console.error = (...args: unknown[]) => {
        const msg = typeof args[0] === "string" ? args[0] : "";
        if (
          msg.includes("bis_skin_checked") ||
          msg.includes("bis_register") ||
          (msg.includes("hydrated but some attributes") && msg.includes("bis_"))
        ) {
          return;
        }
        originalError(...args);
      };
    }
  }, []);

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "hsl(28, 7%, 11%)",
          colorText: "hsl(35, 15%, 93%)",
          colorPrimary: "hsl(34, 96%, 53%)",
          colorInputBackground: "hsl(28, 5%, 15%)",
          colorInputText: "hsl(35, 15%, 93%)",
          colorTextSecondary: "hsl(28, 10%, 75%)",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
