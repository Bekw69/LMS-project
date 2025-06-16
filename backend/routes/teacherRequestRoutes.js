const express = require('express');
const router = express.Router();

// Импорт контроллеров и middleware
const {
    createTeacherRequest,
    getTeacherRequests,
    getAllTeacherRequests,
    getTeacherRequestById,
    updateTeacherRequest,
    approveTeacherRequest,
    rejectTeacherRequest,
    deleteTeacherRequest,
    upload
} = require('../controllers/teacherRequestController');

const { authenticateToken, adminOnly, adminAndTeacher } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Валидация для создания заявки
const validateTeacherRequestCreation = [
    body('requestType')
        .isIn(['schedule_change', 'new_subject', 'class_replacement', 'leave_request', 'resource_request', 'other'])
        .withMessage('Недопустимый тип заявки'),
    body('title')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Заголовок должен содержать от 5 до 100 символов'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Описание должно содержать от 10 до 1000 символов'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Недопустимый приоритет'),
    handleValidationErrors
];

// Валидация для ответа админа
const validateAdminResponse = [
    body('responseMessage')
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Сообщение ответа должно содержать от 5 до 500 символов'),
    body('additionalNotes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Дополнительные заметки не должны превышать 500 символов'),
    handleValidationErrors
];

// Маршруты для учителей
router.post('/', 
    authenticateToken, 
    adminAndTeacher,
    upload.array('attachments', 5), // максимум 5 файлов
    validateTeacherRequestCreation,
    createTeacherRequest
);

router.get('/my-requests', 
    authenticateToken, 
    adminAndTeacher,
    getTeacherRequests
);

router.get('/teacher/:teacherId', 
    authenticateToken, 
    adminOnly,
    getTeacherRequests
);

router.get('/:requestId', 
    authenticateToken, 
    adminAndTeacher,
    getTeacherRequestById
);

router.put('/:requestId', 
    authenticateToken, 
    adminAndTeacher,
    validateTeacherRequestCreation,
    updateTeacherRequest
);

router.delete('/:requestId', 
    authenticateToken, 
    adminAndTeacher,
    deleteTeacherRequest
);

// Маршруты только для админов
router.get('/', 
    authenticateToken, 
    adminOnly,
    getAllTeacherRequests
);

router.post('/:requestId/approve', 
    authenticateToken, 
    adminOnly,
    validateAdminResponse,
    approveTeacherRequest
);

router.post('/:requestId/reject', 
    authenticateToken, 
    adminOnly,
    validateAdminResponse,
    rejectTeacherRequest
);

// Статистика заявок (только для админов)
router.get('/stats/overview', authenticateToken, adminOnly, async (req, res) => {
    try {
        const TeacherRequest = require('../models/teacherRequestSchema');
        
        const stats = await TeacherRequest.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    },
                    inReview: {
                        $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] }
                    },
                    urgent: {
                        $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
                    }
                }
            }
        ]);

        const typeStats = await TeacherRequest.aggregate([
            {
                $group: {
                    _id: '$requestType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyStats = await TeacherRequest.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    inReview: 0,
                    urgent: 0
                },
                byType: typeStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {}),
                monthly: monthlyStats
            }
        });

    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики',
            error: error.message
        });
    }
});

module.exports = router; 