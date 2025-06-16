const { body, validationResult } = require('express-validator');

// Middleware для обработки ошибок валидации
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Ошибки валидации',
            errors: errors.array()
        });
    }
    next();
};

// Валидация для регистрации админа
const validateAdminRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя должно содержать от 2 до 50 символов'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Введите корректный email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов'),
    body('schoolName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Название школы должно содержать от 2 до 100 символов'),
    handleValidationErrors
];

// Валидация для входа
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Введите корректный email'),
    body('password')
        .notEmpty()
        .withMessage('Пароль обязателен'),
    handleValidationErrors
];

// Валидация для создания студента
const validateStudentCreation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя должно содержать от 2 до 50 символов'),
    body('rollNum')
        .isNumeric()
        .withMessage('Номер студента должен быть числом'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов'),
    body('sclassName')
        .notEmpty()
        .withMessage('Класс обязателен'),
    handleValidationErrors
];

// Валидация для создания учителя
const validateTeacherCreation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя должно содержать от 2 до 50 символов'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Введите корректный email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов'),
    body('teachSubject')
        .notEmpty()
        .withMessage('Предмет обязателен'),
    handleValidationErrors
];

// Валидация для создания класса
const validateClassCreation = [
    body('sclassName')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Название класса должно содержать от 1 до 20 символов'),
    handleValidationErrors
];

// Валидация для создания предмета
const validateSubjectCreation = [
    body('subName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Название предмета должно содержать от 2 до 50 символов'),
    body('subCode')
        .trim()
        .isLength({ min: 2, max: 10 })
        .withMessage('Код предмета должен содержать от 2 до 10 символов'),
    body('sessions')
        .isNumeric()
        .isInt({ min: 1, max: 10 })
        .withMessage('Количество занятий должно быть от 1 до 10'),
    handleValidationErrors
];

// Валидация для создания уведомления
const validateNoticeCreation = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Заголовок должен содержать от 5 до 100 символов'),
    body('details')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Описание должно содержать от 10 до 500 символов'),
    handleValidationErrors
];

// Валидация для создания жалобы
const validateComplainCreation = [
    body('complaint')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Жалоба должна содержать от 10 до 500 символов'),
    handleValidationErrors
];

// Валидация для обновления посещаемости
const validateAttendanceUpdate = [
    body('subName')
        .notEmpty()
        .withMessage('Предмет обязателен'),
    body('status')
        .isIn(['Present', 'Absent'])
        .withMessage('Статус должен быть Present или Absent'),
    body('date')
        .isISO8601()
        .withMessage('Введите корректную дату'),
    handleValidationErrors
];

// Валидация для выставления оценок
const validateMarksUpdate = [
    body('subName')
        .notEmpty()
        .withMessage('Предмет обязателен'),
    body('marksObtained')
        .isNumeric()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Оценка должна быть от 0 до 100'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateAdminRegistration,
    validateLogin,
    validateStudentCreation,
    validateTeacherCreation,
    validateClassCreation,
    validateSubjectCreation,
    validateNoticeCreation,
    validateComplainCreation,
    validateAttendanceUpdate,
    validateMarksUpdate
}; 