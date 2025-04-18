import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

const BOT_TOKEN = '8112346828:AAFLfqkV0eQa4mFp6pFSCGLpLwucpD1rBBc';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export async function initializeBot() {
  try {
    const launchParams = retrieveLaunchParams();
    const tgWebAppUser = launchParams.tgWebAppUser as TelegramUser;
    
    if (!tgWebAppUser) {
      throw new Error('User data not available');
    }

    // Send welcome message
    await sendMessage(tgWebAppUser.id, `Привет, ${tgWebAppUser.first_name}! Добро пожаловать в мое приложение! 🎉`);
    
    return {
      userId: tgWebAppUser.id,
      username: tgWebAppUser.username,
      firstName: tgWebAppUser.first_name,
      lastName: tgWebAppUser.last_name,
    };
  } catch (error) {
    console.error('Error initializing bot:', error);
    throw error;
  }
}

export async function sendMessage(userId: number, message: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: userId,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      throw new Error(`Failed to send message: ${errorData.description || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
} 