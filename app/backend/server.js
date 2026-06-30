import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit'; // Импортируем защиту от спама

// Получаем путь к текущей директории файла сервера
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Указываем точный путь к .env
dotenv.config({ path: path.resolve(__dirname, './../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

/* 
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'https://ваш-домен.com', // Замените на домен вашего сайта
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
*/
// 1. НАСТРОЙКА CORS (Защита от чужих сайтов)
app.use(cors())

// Разрешаем принимать JSON
app.use(express.json());

// 2. ЗАЩИТА ОТ СПАМА (Лимит: не более 5 заявок с одного IP за 15 минут)
const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { 
        status: 'error', 
        message: 'Слишком много отправок. Попробуйте позже.' 
    }
});

// Главный маршрут для обработки формы
app.post('/api/send-telegram', formLimiter, async (req, res) => {
    try {
        const { name, email, number, tarif } = req.body;

        // БЭКЕНД-ВАЛИДАЦИЯ
        if (!name?.trim() || !tarif || !email?.trim() || !number?.trim()) {
            return res.status(400).json({ status: 'error', message: 'Все поля обязательны для заполнения!' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ status: 'error', message: 'Некорректный формат Email!' });
        }

        // Функции экранирования для безопасности от Markdown-инъекций (XSS)
        const escapeMarkdown = (text) => {
            if(!text) return '';
            // Экранируем символы, которые могут сломать разметку в Telegram
            return text.toString().replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
        };

        // Формируем текст для Telegram
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        const messageText = `📩 *Новая заявка с сайта*\n\n` +
                            `👤 *Имя:* ${escapeMarkdown(name.trim())}\n` +
                            `🛠 *Тариф:* ${escapeMarkdown(tarif)}\n\n` +
                            `📧 *Email:* ${escapeMarkdown(email.trim())}\n` +
                            `📞 *Номер:* ${escapeMarkdown(number.trim())}`;

        // Тайм-аут для защиты от "зависших" соединений
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Отправляем запрос в Telegram API
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
            signal: controller.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'MarkdownV2' // Используем строгий парсинг с экранированием
            })
        });

        clearTimeout(timeoutId); // Очищаем тайм-аут

        if (!response.ok) {
            throw new Error(`Telegram API Error: ${response.status}`);
        }

        const telegramResult = await response.json();

        if (telegramResult.ok) {
            return res.status(200).json({ status: 'success', message: 'Данные успешно отправлены в Telegram!' });
        } else {
            console.error('Ошибка Telegram API:', telegramResult.description); 
            return res.status(500).json({ status: 'error', message: 'Ошибка при отправке в мессенджер.' });
        }

    } catch (error) {
        // Логируем ошибку для дебага, не раскрывая пользователю системных путей
        console.error('Системная ошибка сервера:', error.message);
        
        if (error.name === 'AbortError') {
             return res.status(500).json({ status: 'error', message: 'Время ожидания ответа истекло.' });
        }
        return res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера.' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на порту ${PORT}`);
});
