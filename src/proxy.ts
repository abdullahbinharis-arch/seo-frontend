export { auth as proxy } from "@/auth";

export const config = {
  // Run middleware on everything EXCEPT:
  //  - /login and /register (public auth pages)
  //  - /api/auth/** (NextAuth internal routes)
  //  - Next.js internals (_next/static, _next/image)
  //  - favicon
  matcher: [
    "/((?!login|register|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
