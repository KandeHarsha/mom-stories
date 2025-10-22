// src/services/auth-service.ts
import { z } from 'zod';
import axios from 'axios';

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters."),
    phase: z.enum(["preparation", "pregnancy", "fourth_trimester", "beyond"]).optional()
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;


// export async function registerUser(data: RegisterInput): Promise<any> {
//     try {
//         const response = await axios.post(
//             `${process.env.LOGINRADIUSBASE_URL}/identity/v2/manage/account`,
//             {
//                 Email: [{ Type: "Primary", Value: data.email }],
//                 Password: data.password,
//                 FirstName: data.name,
//                 Company: data.phase || null
                // CustomFields: {
                //     Phase: data.phase || '',
                // }
//                 // Add additional profile fields if needed
//             },
//             {
//                 params: {
//                     apikey: process.env.LOGINRADIUS_API_KEY,
//                     apisecret: process.env.LOGINRADIUS_API_SECRET,
//                 },

//                 headers: { 'Content-Type': 'application/json' }
//             }
//         );
//         return response.data;
//     } catch (error: any) {
//         throw new Error(error.response?.data?.Description || 'Registration failed.');
//     }
// }

export async function registerUser(data: RegisterInput): Promise<any> {
    try {
        const response = await axios.post(
            `${process.env.LOGINRADIUSBASE_URL}/identity/v2/auth/register`,
            {
                Email: [{ Type: "Primary", Value: data.email }],
                Password: data.password,
                FirstName: data.name,
                Company: data.phase || null,
                // CustomFields: {
                //     Phase: data.phase || '',
                // }
                // Add additional fields if needed
            },
            {
                params: {
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_APIKEY,
                    verificationurl: `${process.env.BASE_URL}/api/auth/verify`
                },
                headers: {
                    'Content-Type': 'application/json',
                    'X-LoginRadius-Sott': process.env.NEXT_PUBLIC_LOGINRADIUS_SOTT // SOTT required for registration
                }
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
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_APIKEY,
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

export async function validateAccessToken(token: string): Promise<any> {
    try {
        const response = await axios.get(
             `${process.env.LOGINRADIUSBASE_URL}/identity/v2/auth/access_token/validate`,
             {
                params: {
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_APIKEY,
                    apisecret: process.env.LOGINRADIUS_API_SECRET,
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
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_APIKEY
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
            {FirstName: profileFields.name, Company: profileFields.phase},
            {
                params: {
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_APIKEY
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

export async function verifyEmail(vtoken: string): Promise<any> {
    try {
        const response = await axios.get(
            `${process.env.LOGINRADIUSBASE_URL}/identity/v2/auth/email`,
            {
                params: {
                    apikey: process.env.NEXT_PUBLIC_LOGINRADIUS_APIKEY,
                    verificationtoken: vtoken,
                    verificationtype: 'emailverification'
                }
            }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.Description || "Email verification failed.");
    }
}



export async function logoutUser() {
    // Logout is handled by clearing the session cookie on the server
    // No Firebase auth sign out needed since we're using LoginRadius
    return Promise.resolve();
}
