// Импортируем и конфигурируем dotenv в самом начале.
// Это позволит использовать переменные из .env файла во всем приложении.
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const winston = require("winston");

// Импорт маршрутов и контроллеров
const Routes = require("./routes/route.js");
const { createPreinstalledAdmin } = require("./controllers/admin-controller.js");

// Импорт middleware
const { 
    generalLimiter, 
    securityHeaders, 
    logSuspiciousActivity, 
    requestSizeLimit 
} = require("./middleware/security.js");

const app = express();
const server = http.createServer(app);

// Настройка логирования
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'school-management' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ],
});

// Создание директории для логов
const fs = require('fs');
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

// Настройка Socket.IO с CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ["http://localhost:3000", "http://127.0.0.1:3000"];

const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Определяем порт. Либо из переменной окружения, либо 5000 по умолчанию.
const PORT = process.env.PORT || 5000;

// Middleware для безопасности
app.use(securityHeaders);
app.use(generalLimiter);
app.use(logSuspiciousActivity);
app.use(requestSizeLimit);

// Middleware для обработки JSON и CORS
app.use(express.json({ 
    limit: process.env.MAX_FILE_SIZE || '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Статическая раздача файлов из папки uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Делаем io и logger доступными в контроллерах
app.set('io', io);
app.set('logger', logger);

// Middleware для логирования запросов
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});

// Socket.IO обработка подключений
io.on('connection', (socket) => {
    logger.info('Пользователь подключился:', { socketId: socket.id });

    // Присоединение к комнате чата
    socket.on('join-chat', (chatId) => {
        socket.join(chatId);
        logger.info(`Пользователь ${socket.id} присоединился к чату ${chatId}`);
    });

    // Покидание комнаты чата
    socket.on('leave-chat', (chatId) => {
        socket.leave(chatId);
        logger.info(`Пользователь ${socket.id} покинул чат ${chatId}`);
    });

    // Присоединение к комнате уведомлений
    socket.on('join-notifications', (userId) => {
        socket.join(`notifications_${userId}`);
        logger.info(`Пользователь ${socket.id} подписался на уведомления ${userId}`);
    });

    // Отправка сообщения
    socket.on('send-message', (data) => {
        // Отправляем сообщение всем в комнате, кроме отправителя
        socket.to(data.chatId).emit('new-message', data.message);
        logger.info('Сообщение отправлено', { chatId: data.chatId, senderId: data.senderId });
    });

    // Пользователь печатает
    socket.on('typing', (data) => {
        socket.to(data.chatId).emit('user-typing', {
            userId: data.userId,
            userName: data.userName,
            isTyping: data.isTyping
        });
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
        logger.info('Пользователь отключился:', { socketId: socket.id });
    });
});

// Подключение к MongoDB - сначала пробуем .env, потом локальное подключение
const MONGO_CONNECTION_STRING = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/school";
logger.info("Попытка подключения к MongoDB:", { connectionString: MONGO_CONNECTION_STRING.replace(/\/\/.*@/, '//***:***@') });

// Подключение к MongoDB (не блокирует сервер)
mongoose
    .connect(MONGO_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Таймаут 5 секунд
        maxPoolSize: 10, // Максимальное количество соединений в пуле
    })
    .then(async () => {
        logger.info("Успешное подключение к MongoDB");
        await createPreinstalledAdmin();
    })
    .catch((err) => {
        logger.error("ОШИБКА ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ:", err);
        console.log("Сервер продолжает работать без MongoDB");
    });

// Обработка событий MongoDB
mongoose.connection.on('error', (err) => {
    logger.error('Ошибка MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB отключена');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB переподключена');
});

// Подключаем маршруты
app.use('/', Routes);

// Простой тестовый маршрут
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Backend работает!', 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0'
    });
});

// Маршрут для проверки здоровья системы
app.get('/health', async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime(),
        database: 'disconnected',
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    };

    try {
        await mongoose.connection.db.admin().ping();
        health.database = 'connected';
    } catch (error) {
        health.database = 'error';
        health.status = 'ERROR';
    }

    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
});

// Middleware для обработки 404 ошибок
app.use('*', (req, res) => {
    logger.warn(`404 - Маршрут не найден: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден',
        path: req.originalUrl,
        method: req.method
    });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
    logger.error('Необработанная ошибка:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Не показываем стек ошибки в production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Внутренняя ошибка сервера',
        ...(isDevelopment && { stack: error.stack })
    });
});

// Обработка необработанных промисов
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Необработанное отклонение промиса:', { reason, promise });
});

process.on('uncaughtException', (error) => {
    logger.error('Необработанное исключение:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM получен, начинаем graceful shutdown');
    server.close(() => {
        logger.info('HTTP сервер закрыт');
        mongoose.connection.close(false, () => {
            logger.info('MongoDB соединение закрыто');
            process.exit(0);
        });
    });
});

// Запускаем сервер
server.listen(PORT, () => {
    logger.info(`Сервер запущен на порту ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
    });
    
    console.log(`Server started at port no. ${PORT}`);
    console.log(`Тест: http://localhost:${PORT}/test`);
    console.log(`Здоровье: http://localhost:${PORT}/health`);
    console.log(`Socket.IO сервер запущен`);
});
