
'use server';
/**
 * @fileOverview Registers a new user with Firebase Authentication.
 *
 * - signUpUser - A function that handles user registration.
 * - SignUpUserInput - The input type for the signUpUser function.
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { z } from 'zod';

const SignUpUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignUpUserInput = z.infer<typeof SignUpUserInputSchema>;

export async function signUpUser(input: SignUpUserInput): Promise<{ uid: string }> {
  const { email, password } = input;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { uid: userCredential.user.uid };
  } catch (error: any) {
    // Firebase errors have a `code` property
    throw new Error(error.code || 'Failed to create account.');
  }
}
