import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * This is a one-time setup route to set the first admin.
 * In production, you should protect this with a secret key or remove it after first use.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, secretKey } = await request.json();
    
    // IMPORTANT: Add a secret key check for security
    const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET;
    
    if (!ADMIN_SETUP_SECRET) {
      return Response.json(
        { error: 'Admin setup is not configured' },
        { status: 500 }
      );
    }
    
    if (secretKey !== ADMIN_SETUP_SECRET) {
      return Response.json(
        { error: 'Invalid secret key' },
        { status: 403 }
      );
    }

    // Find user by email (you'll need to implement this based on your DB adapter)
    // For MongoDB, you can do:
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_CLUSTER_URL as string);
    await client.connect();
    const db = client.db();
    
    const user = await db.collection('user').findOne({ email });
    
    if (!user) {
      await client.close();
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user role to admin
    await db.collection('user').updateOne(
      { _id: user._id },
      { $set: { role: 'admin' } }
    );
    
    await client.close();

    return Response.json({ 
      success: true, 
      message: `User ${email} has been set as admin` 
    });
    
  } catch (error) {
    console.error('Error setting admin:', error);
    return Response.json(
      { error: 'Failed to set admin role' },
      { status: 500 }
    );
  }
}
