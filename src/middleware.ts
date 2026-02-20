export { auth as middleware } from "@/auth";

export const config = {
  // Protect /dashboard/** only — everything else is public
  matcher: ["/dashboard/:path*"],
};
