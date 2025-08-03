
'use server';
/**
 * @fileOverview Signs a user in with Firebase Authentication.
 *
 * - signInUser - A function that handles user sign-in.
 * - SignInUserInput - The input type for the signInUser function.
 */

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { z } from 'zod';

const SignInUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInUserInput = z.infer<typeof SignInUserInputSchema>;

export async function signInUser(input: SignInUserInput): Promise<{ uid: string }> {
  const { email, password } = input;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { uid: userCredential.user.uid };
  } catch (error: any) {
    // Firebase errors have a `code` property
    throw new Error(error.code || 'Failed to sign in.');
  }
}
