// src/services/notification-service.ts
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ExpoNotificationPayload {
  to: string | string[];
  title: string;
  body: string;
}

interface ExpoNotificationResponse {
  data: any;
}

export async function sendPushNotification(
  to: string | string[],
  title: string,
  body: string
): Promise<ExpoNotificationResponse> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        title,
        body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Expo API error: ${JSON.stringify(data)}`);
    }

    return { data };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to send push notification'
    );
  }
}

interface PushTokenData {
    userId: string;
    expoPushToken: string;
    deviceManufacturer?: string;
    deviceModelName?: string;
}

export async function savePushToken(data: PushTokenData): Promise<void> {
    const { userId, expoPushToken, deviceManufacturer, deviceModelName } = data;

    // Sanitize the token to create a valid Firestore document ID
    const sanitizedToken = expoPushToken.replace(/\[|\]/g, '');
    const docId = `${userId}_${sanitizedToken}`;
    const tokenDocRef = doc(db, 'pushTokens', docId);

    try {
        const tokenData = {
            userId,
            expoPushToken,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...(deviceManufacturer && { deviceManufacturer }),
            ...(deviceModelName && { deviceModelName }),
        };
        await setDoc(tokenDocRef, tokenData, { merge: true });
    } catch (e) {
        console.error("Error saving push token: ", e);
        throw new Error('Could not save push token.');
    }
}
