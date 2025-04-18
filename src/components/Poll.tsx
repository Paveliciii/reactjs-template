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
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
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

      setAnswers((prev) => [...prev, `Вопрос ${currentQuestion.id}: ${answer}`]);

      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
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
      {currentQuestionIndex < questions.length ? (
        <>
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
        </>
      ) : (
        <div>
          <h2>Результаты опроса</h2>
          <ul>
            {answers.map((answer, index) => (
              <li key={index}>{answer}</li>
            ))}
          </ul>
        </div>
      )}

      {status && (
        <div style={{ 
          marginTop: '16px', 
          padding: '8px', 
          textAlign: 'center',
          backgroundColor: status.includes('Ошибка') ? '#ffebee' : '#2e7d32',
          color: status.includes('Ошибка') ? '#000000' : '#ffffff',
          borderRadius: '4px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
}