
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
import axios from 'axios';

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


export async function registerUser(data: RegisterInput): Promise<any> {
    try {
        const response = await axios.post(
            `${process.env.LOGINRADIUSBASE_URL}/identity/v2/manage/account`,
            {
                Email: [{ Type: "Primary", Value: data.email }],
                Password: data.password,
                FirstName: data.name,
                // Add additional profile fields if needed
            },
            {
                params: {
                    apikey: process.env.LOGINRADIUS_API_KEY,
                    apisecret: process.env.LOGINRADIUS_API_SECRET, // Only if needed (backend)
                },

                headers: { 'Content-Type': 'application/json' }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.Description || 'Registration failed.');
    }
}


export async function loginUser(data: LoginInput): Promise<any> {
    try {
        const response = await axios.post(
            `${process.env.LOGINRADIUSBASE_URL}/identity/v2/auth/login`,
            {
                email: data.email,
                password: data.password
            },
            {
                params: {
                    apikey: process.env.LOGINRADIUS_API_KEY,
                    apisecret: process.env.LOGINRADIUS_API_SECRET,
                },
                headers: { 'Content-Type': 'application/json' }
            }
        );
        return response.data; // Includes access token and profile info
    } catch (error: any) {
        throw new Error(error.response?.data?.Description || 'Login failed.');
    }
}


// export async function loginUser(data: LoginInput): Promise<UserCredential> {
//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
//         return userCredential;
//     } catch (error: any) {
//         // Handle specific Firebase errors
//         if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
//              throw new Error('Invalid email or password.');
//         }
//         console.error("Error logging in user:", error);
//         throw new Error('Login failed. Please try again.');
//     }
// }

export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw new Error('Logout failed.');
    }
}
