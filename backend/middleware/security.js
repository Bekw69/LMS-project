const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting для API
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: message || 'Слишком много запросов, попробуйте позже'
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Общий rate limit
const generalLimiter = createRateLimit(
    15 * 60 * 1000, // 15 минут
    100, // максимум 100 запросов
    'Слишком много запросов с этого IP, попробуйте через 15 минут'
);

// Строгий rate limit для авторизации
const authLimiter = createRateLimit(
    15 * 60 * 1000, // 15 минут
    5, // максимум 5 попыток
    'Слишком много попыток входа, попробуйте через 15 минут'
);

// Rate limit для создания аккаунтов
const createAccountLimiter = createRateLimit(
    60 * 60 * 1000, // 1 час
    3, // максимум 3 аккаунта
    'Слишком много созданных аккаунтов, попробуйте через час'
);

// Helmet для безопасности заголовков
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "ws:", "wss:"],
        },
    },
    crossOriginEmbedderPolicy: false,
});

// Middleware для логирования подозрительной активности
const logSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
        /script/i,
        /javascript/i,
        /vbscript/i,
        /onload/i,
        /onerror/i,
        /<script/i,
        /eval\(/i,
        /expression\(/i
    ];

    const checkForSuspicious = (obj) => {
        if (typeof obj === 'string') {
            return suspiciousPatterns.some(pattern => pattern.test(obj));
        }
        if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).some(checkForSuspicious);
        }
        return false;
    };

    if (checkForSuspicious(req.body) || checkForSuspicious(req.query)) {
        console.warn(`Подозрительная активность от IP ${req.ip}:`, {
            url: req.url,
            method: req.method,
            body: req.body,
            query: req.query,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
    }

    next();
};

// Middleware для проверки размера запроса
const requestSizeLimit = (req, res, next) => {
    const maxSize = process.env.MAX_REQUEST_SIZE || 10485760; // 10MB по умолчанию
    
    if (req.get('content-length') > maxSize) {
        return res.status(413).json({
            success: false,
            message: 'Размер запроса превышает допустимый лимит'
        });
    }
    
    next();
};

module.exports = {
    generalLimiter,
    authLimiter,
    createAccountLimiter,
    securityHeaders,
    logSuspiciousActivity,
    requestSizeLimit
};