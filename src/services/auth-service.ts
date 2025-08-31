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
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY,
                    apisecret: process.env.LOGINRADIUS_API_SECRET,
                },

                headers: { 'Content-Type': 'application/json' }
            }
        );
        // After successful registration with LoginRadius, create a profile in Firestore
        await createUserProfile(response.data.Uid, { name: data.name, email: data.email });

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
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY,
                },
                headers: { 'Content-Type': 'application/json' }
            }
        );
        return response.data; // Includes access token and profile info
    } catch (error: any) {
        throw new Error(error.response?.data?.Description || 'Login failed.');
    }
}

export async function validateAccessToken(token: string): Promise<any> {
    try {
        const response = await axios.get(
             `${process.env.LOGINRADIUSBASE_URL}/identity/v2/auth/access_token/validate`,
             {
                params: {
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY,
                },
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
             }
        );
        return response.data;
    } catch (error: any) {
         throw new Error(error.response?.data?.Description || 'Token validation failed.');
    }
}

export async function getUserProfile(accessToken: string): Promise<any> {
    try {
        const response = await axios.get(
            `${process.env.LOGINRADIUSBASE_URL}/identity/v2/auth/account`,
            {
                params: {
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data; // Returns user profile data
    } catch (error: any) {
        throw new Error(error.response?.data?.Description || 'Failed to fetch user profile.');
    }
}

export async function updateUserProfile(accessToken: string, profileFields: Record<string, any>): Promise<any> {
    try {
        const response = await axios.put(
            `${process.env.LOGINRADIUSBASE_URL}/identity/v2/auth/account`,
            profileFields,
            {
                params: {
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_API_KEY
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data; // Updated user profile data
    } catch (error: any) {
        throw new Error(error.response?.data?.Description || 'Failed to update user profile.');
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
