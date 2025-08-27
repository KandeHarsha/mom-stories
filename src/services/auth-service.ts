
// src/services/auth-service.ts
import { auth } from '@/lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    type UserCredential
} from "firebase/auth";
import { z } from 'zod';
import { createUserProfile } from './user-service';

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;


export async function registerUser(data: RegisterInput): Promise<UserCredential> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        // After creating the user in Firebase Auth, create their profile in Firestore
        if (userCredential.user) {
            await createUserProfile(userCredential.user.uid, {
                name: data.name,
                email: data.email,
            });
        }
        
        return userCredential;
    } catch (error: any) {
        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email is already registered.');
        }
        console.error("Error registering user:", error);
        throw new Error('Registration failed. Please try again.');
    }
}

export async function loginUser(data: LoginInput): Promise<UserCredential> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        return userCredential;
    } catch (error: any) {
        // Handle specific Firebase errors
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
             throw new Error('Invalid email or password.');
        }
        console.error("Error logging in user:", error);
        throw new Error('Login failed. Please try again.');
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw new Error('Logout failed.');
    }
}
