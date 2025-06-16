const jwt = require('jsonwebtoken');
const Admin = require('../models/adminSchema');
const Teacher = require('../models/teacherSchema');
const Student = require('../models/studentSchema');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Токен доступа не предоставлен'
            });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Находим пользователя в зависимости от роли
        let user = null;
        switch (decoded.role) {
            case 'Admin':
                user = await Admin.findById(decoded.id);
                break;
            case 'Teacher':
                user = await Teacher.findById(decoded.id);
                break;
            case 'Student':
                user = await Student.findById(decoded.id);
                break;
            default:
                return res.status(403).json({
                    success: false,
                    message: 'Недопустимая роль пользователя'
                });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Добавляем информацию о пользователе в запрос
        req.user = {
            id: user._id,
            role: decoded.role,
            email: user.email,
            name: user.name
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Токен истек'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Недействительный токен'
            });
        }
        
        console.error('Ошибка аутентификации:', error);
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Middleware для проверки роли
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не аутентифицирован'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав для выполнения этого действия'
            });
        }

        next();
    };
};

// Middleware только для админов
const adminOnly = authorizeRoles('Admin');

// Middleware для админов и учителей
const adminAndTeacher = authorizeRoles('Admin', 'Teacher');

// Middleware для всех аутентифицированных пользователей
const authenticated = authenticateToken;

module.exports = {
    authenticateToken,
    authorizeRoles,
    adminOnly,
    adminAndTeacher,
    authenticated
}; 