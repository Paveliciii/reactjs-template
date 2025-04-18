import { useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { sendMessage } from '@/helpers/telegramBot';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

interface Question {
  id: number;
  text: string;
  options: string[];
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: 'Какой ваш любимый цвет?',
    options: ['Красный', 'Синий', 'Зеленый', 'Желтый']
  },
  {
    id: 2,
    text: 'Какое ваше любимое время года?',
    options: ['Весна', 'Лето', 'Осень', 'Зима']
  },
  {
    id: 3,
    text: 'Какой ваш любимый жанр музыки?',
    options: ['Поп', 'Рок', 'Классика', 'Джаз']
  }
];

export function Poll() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];

    try {
      const launchParams = retrieveLaunchParams();
      const tgWebAppUser = launchParams.tgWebAppUser as TelegramUser;
      const userId = tgWebAppUser?.id;
      
      if (!userId) {
        console.error('User ID not available');
        return;
      }

      await sendMessage(userId, `Вопрос ${currentQuestion.id}: ${answer}`);
      console.log('Ответ отправлен:', answer);
    } catch (error) {
      console.error('Ошибка при отправке ответа:', error);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '16px' }}>Вопрос {currentQuestion.id} из {questions.length}</h2>
      <p style={{ marginBottom: '24px' }}>{currentQuestion.text}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswer(option)}
            style={{ width: '100%' }}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
} 