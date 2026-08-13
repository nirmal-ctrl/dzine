import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

// NOTE: Only /admin is auth-gated so the dashboard UI can be previewed
// without Google OAuth credentials. Re-add "/dashboard/:path*",
// "/pricing/:path*" and "/success/:path*" for production.
export const config = {
  matcher: ["/admin/:path*"],
};
