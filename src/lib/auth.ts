import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { createAuthMiddleware } from "better-auth/api";
import { dash } from "@better-auth/infra";
import { emailOTP } from "better-auth/plugins";
import { sendPasswordResetOTP, sendVerificationOTP } from "@/services/email-service";

const client = new MongoClient(process.env.MONGODB_CLUSTER_URL as string);
const db = client.db();


export const auth = betterAuth({
  appName: "Mom Stories",
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL as string],
  database: mongodbAdapter(db, {
    client
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  user: {
    additionalFields: {
      phase: {
        type: "string",
        required: true,
      },
      childrenIds: {
        type: "string[]",
        required: false,
      }
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const validPhases = ["preparation", "pregnancy", "post_delivery"];
      
      if (ctx.body && typeof ctx.body === "object" && "phase" in ctx.body) {
        const phase = (ctx.body as Record<string, unknown>).phase;
        if (phase && !validPhases.includes(String(phase))) {
          return {
            status: 400,
            body: {
              error: "Invalid phase. Must be one of: preparation, pregnancy, post_delivery"
            }
          };
        }
      }
    }),
  },
  plugins: [
    dash(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`Sending ${type} OTP to ${email}: ${otp}`);
        
        if (type === "forget-password") {
          await sendPasswordResetOTP(email, otp, 10);
        } else if (type === "email-verification") {
          await sendVerificationOTP(email, otp, 10);
        } else {
          // Default: send verification OTP
          await sendVerificationOTP(email, otp, 10);
        }
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes in seconds
    })
  ]
  // disabledPaths: ["/sign-up/email", "/sign-in/email"],
});