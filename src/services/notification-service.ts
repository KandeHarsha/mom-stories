// src/services/notification-service.ts

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
