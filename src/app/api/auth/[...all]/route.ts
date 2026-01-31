import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);

// Core authentication

// POST /auth/sign-up – create a new user
// POST /auth/sign-in – log a user in
// POST /auth/sign-out – log a user out
// GET /auth/session – get current session/user
// POST /auth/refresh – refresh session (if enabled)

// Email / password utilities

// POST /auth/forgot-password
// POST /auth/reset-password
// POST /auth/verify-email
// POST /auth/send-verification-email


// Passkeys / magic links (if enabled)

// POST /auth/passkey/register
// POST /auth/passkey/authenticate
