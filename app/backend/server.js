import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Точный путь к .env
dotenv.config({ path: path.resolve(__dirname, './../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// !!! КРИТИЧНО ДЛЯ БОЕВОГО СЕРВЕРА !!!
// Говорим Express доверять заголовкам Nginx, чтобы правильно определять IP пользователей, а не банить 127.0.0.1
app.set('trust proxy', 1);

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'https://sintex.by',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// ЗАЩИТА ОТ СПАМА (Не более 3 запросов с одного реального IP за 30 минут)
const formLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, 
    max: 3, 
    message: { 
        status: 'error', 
        message: 'Слишком много отправок. Попробуйте позже.' 
    },
    standardHeaders: true, // Возвращает информацию о лимитах в заголовках RateLimit-*
    legacyHeaders: false,  
});

// Главный маршрут для обработки формы
app.post('/api/send-telegram', formLimiter, async (req, res) => {
    try {
        const { name, email, number, tarif, anti_bot } = req.body;

        // 1. ЗАЩИТА HONEYPOT (Если скрытое поле заполнено роботом — обманываем его успехом)
        if (anti_bot) {
            return res.status(200).json({ status: 'success', message: 'Данные успешно отправлены!' });
        }

        // 2. БЭКЕНД-ВАЛИДАЦИЯ И ОБРЕЗКА СТРОК (Защита от гигантских строк)
        const cleanName = name?.trim().substring(0, 100);
        const cleanEmail = email?.trim().substring(0, 100);
        const cleanNumber = number?.trim().substring(0, 30);
        const cleanTarif = tarif?.trim().substring(0, 100);

        if (!cleanName || !cleanTarif || !cleanEmail || !cleanNumber) {
            return res.status(400).json({ status: 'error', message: 'Все поля обязательны для заполнения!' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ status: 'error', message: 'Некорректный формат Email!' });
        }

        // 3. БЕЗОПАСНОЕ ЭКРАНИРОВАНИЕ ДЛЯ HTML (Защита от тегов и XSS в Telegram)
        const escapeHTML = (text) => {
            if (!text) return '';
            return text.toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };

        // Формируем текст в формате HTML (Самый надежный вариант для Telegram API)
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        const messageText = `📩 <b>Новая заявка с сайта</b>\n\n` +
                            `👤 <b>Имя:</b> ${escapeHTML(cleanName)}\n` +
                            `🛠 <b>Тариф:</b> ${escapeHTML(cleanTarif)}\n\n` +
                            `📧 <b>Email:</b> ${escapeHTML(cleanEmail)}\n` +
                            `📞 <b>Номер:</b> ${escapeHTML(cleanNumber)}`;

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
                parse_mode: 'HTML' // Переключено на HTML во избежание сбоев парсинга MarkdownV2
            })
        });

        clearTimeout(timeoutId);

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
