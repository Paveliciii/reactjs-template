import { useState, useEffect } from 'react';
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

// Тестовые данные для отладки
const testUser: TelegramUser = {
  id: 123456789,
  first_name: 'Test',
  username: 'test_user'
};

export function Poll() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Проверяем, запущено ли приложение внутри Telegram
    const launchParams = retrieveLaunchParams();
    const isTelegramApp = !!launchParams.tgWebAppUser;
    setIsTelegram(isTelegramApp);
    
    if (!isTelegramApp) {
      setStatus('Приложение должно быть запущено через Telegram');
    }
  }, []);

  const handleAnswer = async (answer: string) => {
    setStatus('Обработка ответа...');
    setIsLoading(true);

    const currentQuestion = questions[currentQuestionIndex];

    try {
      const launchParams = retrieveLaunchParams();
      let tgWebAppUser: TelegramUser;

      if (isTelegram) {
        tgWebAppUser = launchParams.tgWebAppUser as TelegramUser;
      } else {
        // Используем тестовые данные для отладки
        tgWebAppUser = testUser;
        setStatus('Тестовый режим: ответ не будет отправлен боту');
      }

      if (!tgWebAppUser || !tgWebAppUser.id) {
        setStatus('Ошибка: не удалось получить данные пользователя');
        return;
      }

      if (isTelegram) {
        setStatus('Отправка ответа...');
        await sendMessage(tgWebAppUser.id, `Вопрос ${currentQuestion.id}: ${answer}`);
        setStatus('Ответ успешно отправлен!');
      }

      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setStatus('');
        }, 1000);
      } else {
        setStatus('Опрос завершен! Спасибо за участие!');
      }
    } catch (error) {
      setStatus('Ошибка при отправке ответа. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ padding: '16px' }}>
      {!isTelegram && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '8px', 
          backgroundColor: '#fff3e0',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          Приложение запущено вне Telegram. Работает в тестовом режиме.
        </div>
      )}
      
      <h2 style={{ marginBottom: '16px' }}>Вопрос {currentQuestion.id} из {questions.length}</h2>
      <p style={{ marginBottom: '24px' }}>{currentQuestion.text}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswer(option)}
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {option}
          </Button>
        ))}
      </div>

      {status && (
        <div style={{ 
          marginTop: '16px', 
          padding: '8px', 
          textAlign: 'center',
          backgroundColor: status.includes('Ошибка') ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
} 