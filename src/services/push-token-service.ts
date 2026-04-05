// src/services/push-token-service.ts
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { MongoClient, ObjectId } from 'mongodb';

export interface PushTokenWithPhase {
  userId: string;
  expoPushToken: string;
  phase?: string;
  userName?: string;
  userEmail?: string;
}

interface PushTokenData {
  userId: string;
  expoPushToken: string;
}

/**
 * Fetches all push tokens from Firestore
 */
export async function getAllPushTokens(): Promise<PushTokenData[]> {
  const pushTokensCol = collection(db, 'pushTokens');
  const pushTokensSnapshot = await getDocs(pushTokensCol);
  
  const pushTokensData: PushTokenData[] = [];
  pushTokensSnapshot.forEach((doc) => {
    const data = doc.data();
    pushTokensData.push({
      userId: data.userId,
      expoPushToken: data.expoPushToken,
    });
  });
  
  return pushTokensData;
}

/**
 * Fetches push tokens for specific user IDs from Firestore
 */
export async function getPushTokensByUserIds(userIds: string[]): Promise<PushTokenData[]> {
  if (userIds.length === 0) {
    return [];
  }

  const pushTokensCol = collection(db, 'pushTokens');
  const pushTokensSnapshot = await getDocs(pushTokensCol);
  
  const pushTokensData: PushTokenData[] = [];
  pushTokensSnapshot.forEach((doc) => {
    const data = doc.data();
    if (userIds.includes(data.userId)) {
      pushTokensData.push({
        userId: data.userId,
        expoPushToken: data.expoPushToken,
      });
    }
  });
  
  return pushTokensData;
}

/**
 * Fetches user data from MongoDB for given user IDs
 */
export async function getUsersByIds(userIds: string[]): Promise<Map<string, { phase?: string; name?: string; email?: string }>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const mongoClient = new MongoClient(process.env.MONGODB_CLUSTER_URL as string);
  
  try {
    await mongoClient.connect();
    const mongoDb = mongoClient.db();
    
    // Convert string IDs to ObjectIds for MongoDB query
    const objectIds = userIds.map((id) => new ObjectId(id));
    
    const users = await mongoDb
      .collection('user')
      .find({ _id: { $in: objectIds } })
      .toArray();
    
    return new Map(
      users.map((user) => [user._id.toString(), { phase: user.phase, name: user.name, email: user.email }])
    );
  } finally {
    await mongoClient.close();
  }
}

/**
 * Fetches user IDs from MongoDB filtered by phase
 */
export async function getUserIdsByPhase(phase: string): Promise<{ id: string; name?: string; email?: string }[]> {
  const mongoClient = new MongoClient(process.env.MONGODB_CLUSTER_URL as string);
  
  try {
    await mongoClient.connect();
    const mongoDb = mongoClient.db();
    
    const users = await mongoDb
      .collection('user')
      .find({ phase })
      .toArray();
    
    return users.map((user) => ({ id: user._id.toString(), name: user.name, email: user.email }));
  } finally {
    await mongoClient.close();
  }
}

/**
 * Fetches push tokens with user phase data, optionally filtered by phase
 */
export async function getPushTokensWithUserData(phaseFilter?: string | null): Promise<PushTokenWithPhase[]> {
  // If phase filter is provided, first get userIds from MongoDB, then get their tokens
  if (phaseFilter) {
    const usersWithPhase = await getUserIdsByPhase(phaseFilter);
    
    if (usersWithPhase.length === 0) {
      return [];
    }

    const userIds = usersWithPhase.map((u) => u.id);
    const userMap = new Map(usersWithPhase.map((u) => [u.id, { name: u.name, email: u.email }]));
    
    const pushTokensData = await getPushTokensByUserIds(userIds);

    return pushTokensData.map((token) => {
      const userData = userMap.get(token.userId);
      return {
        userId: token.userId,
        expoPushToken: token.expoPushToken,
        phase: phaseFilter,
        userName: userData?.name,
        userEmail: userData?.email,
      };
    });
  }

  // No phase filter - get all push tokens and enrich with user data
  const pushTokensData = await getAllPushTokens();
  
  if (pushTokensData.length === 0) {
    return [];
  }

  const userIds = [...new Set(pushTokensData.map((t) => t.userId))];
  const userMap = await getUsersByIds(userIds);

  return pushTokensData.map((token) => {
    const userData = userMap.get(token.userId);
    return {
      userId: token.userId,
      expoPushToken: token.expoPushToken,
      phase: userData?.phase,
      userName: userData?.name,
      userEmail: userData?.email,
    };
  });
}
