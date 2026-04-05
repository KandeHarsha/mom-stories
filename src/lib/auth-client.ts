import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002",
  plugins: [
    adminClient(),
  ],
});

export const { useSession, signIn, signOut, signUp } = authClient;
