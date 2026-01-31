import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware } from "better-auth/api";

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
			console.log("Request path:", ctx.path);
		}),
  },
  // disabledPaths: ["/sign-up/email", "/sign-in/email"],
});