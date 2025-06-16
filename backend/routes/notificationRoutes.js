const express = require('express');
const router = express.Router();

// Импорт контроллеров и middleware
const {
    getUserNotifications,
    getUnreadCount,
    getNotificationStats,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    unarchiveNotification,
    deleteNotification,
    bulkOperations,
    createNotification,
    getNotificationById
} = require('../controllers/notificationController');

const { authenticateToken, adminOnly } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Валидация для создания уведомления
const validateNotificationCreation = [
    body('recipients')
        .isArray({ min: 1 })
        .withMessage('Необходимо указать хотя бы одного получателя'),
    body('recipients.*.id')
        .isMongoId()
        .withMessage('Недопустимый ID получателя'),
    body('recipients.*.model')
        .isIn(['admin', 'teacher', 'student'])
        .withMessage('Недопустимая модель получателя'),
    body('type')
        .isIn([
            'grade_update', 'attendance_update', 'teacher_request_status',
            'new_teacher_request', 'schedule_change', 'new_assignment',
            'assignment_due', 'system_announcement', 'account_created',
            'password_reset', 'class_cancelled', 'exam_scheduled',
            'fee_reminder', 'general'
        ])
        .withMessage('Недопустимый тип уведомления'),
    body('title')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Заголовок должен содержать от 5 до 100 символов'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Сообщение должно содержать от 10 до 500 символов'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Недопустимый приоритет'),
    body('category')
        .optional()
        .isIn(['academic', 'administrative', 'personal', 'system'])
        .withMessage('Недопустимая категория'),
    handleValidationErrors
];

// Валидация для массовых операций
const validateBulkOperations = [
    body('operation')
        .isIn(['markAsRead', 'markAsUnread', 'archive', 'unarchive', 'delete'])
        .withMessage('Недопустимая операция'),
    body('notificationIds')
        .isArray({ min: 1 })
        .withMessage('Необходимо указать хотя бы один ID уведомления'),
    body('notificationIds.*')
        .isMongoId()
        .withMessage('Недопустимый ID уведомления'),
    handleValidationErrors
];

// Получение уведомлений пользователя
router.get('/', authenticateToken, getUserNotifications);

// Получение количества непрочитанных уведомлений
router.get('/unread-count', authenticateToken, getUnreadCount);

// Получение статистики уведомлений
router.get('/stats', authenticateToken, getNotificationStats);

// Получение конкретного уведомления
router.get('/:notificationId', authenticateToken, getNotificationById);

// Отметить уведомление как прочитанное
router.patch('/:notificationId/read', authenticateToken, markAsRead);

// Отметить уведомление как непрочитанное
router.patch('/:notificationId/unread', authenticateToken, markAsUnread);

// Отметить все уведомления как прочитанные
router.patch('/mark-all-read', authenticateToken, markAllAsRead);

// Архивировать уведомление
router.patch('/:notificationId/archive', authenticateToken, archiveNotification);

// Разархивировать уведомление
router.patch('/:notificationId/unarchive', authenticateToken, unarchiveNotification);

// Удалить уведомление
router.delete('/:notificationId', authenticateToken, deleteNotification);

// Массовые операции с уведомлениями
router.post('/bulk-operations', 
    authenticateToken, 
    validateBulkOperations,
    bulkOperations
);

// Создание уведомления (только для админов)
router.post('/', 
    authenticateToken, 
    adminOnly,
    validateNotificationCreation,
    createNotification
);

// Получение всех уведомлений системы (только для админов)
router.get('/admin/all', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { page = 1, limit = 20, type, priority, recipientModel } = req.query;
        const Notification = require('../models/notificationSchema');

        const query = {};
        if (type) query.type = type;
        if (priority) query.priority = priority;
        if (recipientModel) query.recipientModel = recipientModel;

        const notifications = await Notification.find(query)
            .populate('recipient', 'name email')
            .populate('sender', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Ошибка получения всех уведомлений:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения уведомлений',
            error: error.message
        });
    }
});

// Статистика уведомлений системы (только для админов)
router.get('/admin/stats', authenticateToken, adminOnly, async (req, res) => {
    try {
        const Notification = require('../models/notificationSchema');

        const stats = await Notification.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    unread: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    },
                    archived: {
                        $sum: { $cond: [{ $eq: ['$isArchived', true] }, 1, 0] }
                    },
                    urgent: {
                        $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
                    },
                    actionRequired: {
                        $sum: { $cond: [{ $eq: ['$actionRequired', true] }, 1, 0] }
                    }
                }
            }
        ]);

        const typeStats = await Notification.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recipientStats = await Notification.aggregate([
            {
                $group: {
                    _id: '$recipientModel',
                    count: { $sum: 1 }
                }
            }
        ]);

        const dailyStats = await Notification.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
            { $limit: 30 }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    total: 0,
                    unread: 0,
                    archived: 0,
                    urgent: 0,
                    actionRequired: 0
                },
                byType: typeStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {}),
                byRecipient: recipientStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {}),
                daily: dailyStats
            }
        });

    } catch (error) {
        console.error('Ошибка получения статистики уведомлений:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики',
            error: error.message
        });
    }
});

// Отправка тестового уведомления (только для админов в режиме разработки)
if (process.env.NODE_ENV === 'development') {
    router.post('/admin/test', authenticateToken, adminOnly, async (req, res) => {
        try {
            const { recipientId, recipientModel } = req.body;
            const Notification = require('../models/notificationSchema');

            const notification = await Notification.create({
                recipient: recipientId,
                recipientModel: recipientModel,
                sender: req.user.id,
                senderModel: 'admin',
                type: 'system_announcement',
                title: 'Тестовое уведомление',
                message: 'Это тестовое уведомление для проверки системы',
                priority: 'medium',
                category: 'system'
            });

            // Отправляем через Socket.IO
            const io = req.app.get('io');
            io.to(`notifications_${recipientId}`).emit('new-notification', {
                type: 'system_announcement',
                title: 'Тестовое уведомление',
                message: 'Это тестовое уведомление для проверки системы',
                priority: 'medium'
            });

            res.json({
                success: true,
                message: 'Тестовое уведомление отправлено',
                data: notification
            });

        } catch (error) {
            console.error('Ошибка отправки тестового уведомления:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка отправки уведомления',
                error: error.message
            });
        }
    });
}

module.exports = router; 