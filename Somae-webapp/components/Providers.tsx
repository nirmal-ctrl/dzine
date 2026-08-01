"use client";

import * as React from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";

function SessionExpirationChecker({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === "authenticated" && session) {
      // 1. Check next-auth session.expires (ISO string)
      const sessionExpires = new Date(session.expires).getTime();
      const now = Date.now();

      // 2. Check access token expiresAt if present (unix timestamp in seconds)
      const accessTokenExpires = (session as unknown as Record<string, unknown>).expiresAt 
        ? ((session as unknown as Record<string, unknown>).expiresAt as number) * 1000 
        : null;

      const isSessionExpired = now >= sessionExpires;
      const isAccessTokenExpired = accessTokenExpires ? now >= accessTokenExpires : false;

      if (isSessionExpired || isAccessTokenExpired) {
        console.warn("[Session Checker] Token or session expired. Logging out...");
        signOut({ callbackUrl: "/auth/signin" });
      }
    }
  }, [session, status]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <SessionExpirationChecker>{children}</SessionExpirationChecker>
      </SessionProvider>
    </ThemeProvider>
  );
}
