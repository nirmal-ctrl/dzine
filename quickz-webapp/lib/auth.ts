import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        const userObj = session.user as unknown as Record<string, unknown>;
        userObj.id = token.sub;
        userObj.role = token.role;
        
        const sessionObj = session as unknown as Record<string, unknown>;
        sessionObj.accessToken = token.accessToken;
        sessionObj.expiresAt = token.expiresAt;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
      }
      if (user) {
        const userObj = user as unknown as Record<string, unknown>;
        token.role = userObj.role;
      } else {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  logger: {
    error(code, metadata) {
      console.error("[NEXT-AUTH ERROR]", code, metadata);
    },
    warn(code) {
      console.warn("[NEXT-AUTH WARN]", code);
    },
    debug(code, metadata) {
      console.log("[NEXT-AUTH DEBUG]", code, metadata);
    }
  }
};
