import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { DefaultSession } from "next-auth";

// ---------------------------------------------------------------------------
// Extend the built-in Session / JWT types so TypeScript knows about
// accessToken and user.id without casts elsewhere.
// ---------------------------------------------------------------------------
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: { id: string } & DefaultSession["user"];
  }
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function loginWithFastAPI(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; email: string; access_token: string }>;
}

async function oauthSyncWithFastAPI(email: string, googleSub: string, name?: string) {
  const res = await fetch(`${API_URL}/auth/oauth-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, google_sub: googleSub, name }),
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; email: string; access_token: string }>;
}

// ---------------------------------------------------------------------------
// NextAuth configuration
// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await loginWithFastAPI(
          credentials.email as string,
          credentials.password as string
        );
        if (!user) return null;
        // Return shape that matches what the JWT callback receives as `user`
        return { id: user.id, email: user.email, accessToken: user.access_token };
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    authorized({ auth }) {
      // Returning false redirects unauthenticated users to pages.signIn (/login).
      // The proxy.ts matcher already excludes /login and /register, so those
      // pages are never passed through this callback.
      return !!auth;
    },

    async jwt({ token, user, account, profile }) {
      // Credentials sign-in: user object is populated on first call
      if (user) {
        token.sub = user.id;
        // `user` comes from `authorize()` above; cast to access our extra field
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }

      // Google OAuth: sync with FastAPI to create/find the user
      if (account?.provider === "google" && profile?.email) {
        const data = await oauthSyncWithFastAPI(
          profile.email,
          (profile as { sub?: string }).sub ?? "",
          profile.name ?? undefined
        );
        if (data) {
          token.sub = data.id;
          token.accessToken = data.access_token;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      if (session.user) session.user.id = token.sub ?? "";
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
