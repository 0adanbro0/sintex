<?php
/**
 * Чистый бэкенд-обработчик отправки формы в Telegram
 * Версия для PHP 8+ с отправкой через cURL без file_get_contents
 */

// 1. НАСТРОЙКА CORS И ЗАГОЛОВКОВ
header("Access-Control-Allow-Origin: https://sintex.by");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Обработка предварительного OPTIONS запроса браузера
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Принимаем строго POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Метод не поддерживается"]);
    exit();
}

// 2. АБСОЛЮТНЫЙ ПУТЬ И ЧТЕНИЕ ФАЙЛА .env
$envPath = '/var/www/h210984/data/node-backend/.env';

if (!file_exists($envPath)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Конфигурационный файл не найден."]);
    exit();
}

// Используем встроенный парсер файлов конфигурации
$config = parse_ini_file($envPath);
$botToken = isset($config['TELEGRAM_BOT_TOKEN']) ? trim($config['TELEGRAM_BOT_TOKEN'], " \t\n\r\0\x0B\"'") : null;
$chatId   = isset($config['TELEGRAM_CHAT_ID']) ? trim($config['TELEGRAM_CHAT_ID'], " \t\n\r\0\x0B\"'") : null;

if (!$botToken || !$chatId) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Токены конфигурации в .env отсутствуют."]);
    exit();
}

// Если вы случайно скопировали слово 'bot' внутрь значения .env, скрипт его срежет
if (str_starts_with(strtolower($botToken), 'bot')) {
    $botToken = substr($botToken, 3);
}

// 3. ПОЛУЧЕНИЕ ДАННЫХ ИЗ ТЕЛА ЗАПРОСА ФРОНТЕНДА
$inputData = json_decode(file_get_contents("php://input"), true);
$name   = trim($inputData['name'] ?? 'Тест');
$email  = trim($inputData['email'] ?? 'test@test.com');
$number = trim($inputData['number'] ?? '123');
$tarif  = trim($inputData['tarif'] ?? 'Тест');

// Формируем аккуратный текст сообщения (без Markdown, чтобы исключить синтаксические ошибки)
$messageText = "📩 Новая заявка с сайта\n\n" .
               "👤 Имя: " . $name . "\n" .
               "🛠 Тариф: " . $tarif . "\n\n" .
               "📧 Email: " . $email . "\n" .
               "📞 Номер: " . $number;

// 4. СБОРКА ЧИСТОГО URL И ОТПРАВКА ЧЕРЕЗ cURL
$telegramUrl = "https://api.telegram.org/bot" . $botToken . "/sendMessage";

$postData = [
    'chat_id' => $chatId,
    'text'    => $messageText
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $telegramUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 7); // Время ожидания ответа от Telegram — 7 секунд

$response = curl_exec($ch);
$curlError = curl_error($ch);
curl_close($ch);

// 5. ОТВЕТ ДЛЯ КЛИЕНТСКОГО БРАУЗЕРА
if ($response === false) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Ошибка отправки через cURL: " . $curlError]);
} else {
    $result = json_decode($response, true);
    if (($result['ok'] ?? false) === true) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Данные успешно отправлены в Telegram!"]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Telegram API вернул ошибку: " . ($result['description'] ?? 'Неизвестно')]);
    }
}
