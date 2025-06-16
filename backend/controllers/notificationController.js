const Notification = require('../models/notificationSchema');

// Получение уведомлений пользователя
const getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, priority, isRead, isArchived = false } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            type: type || null,
            priority: priority || null,
            isRead: isRead !== undefined ? isRead === 'true' : null,
            isArchived: isArchived === 'true'
        };

        const notifications = await Notification.getNotificationsByRecipient(req.user.id, options);
        const total = await Notification.countDocuments({
            recipient: req.user.id,
            isArchived: options.isArchived,
            ...(options.type && { type: options.type }),
            ...(options.priority && { priority: options.priority }),
            ...(options.isRead !== null && { isRead: options.isRead })
        });

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
        console.error('Ошибка получения уведомлений:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения уведомлений',
            error: error.message
        });
    }
};

// Получение количества непрочитанных уведомлений
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user.id);
        
        res.json({
            success: true,
            data: { unreadCount: count }
        });

    } catch (error) {
        console.error('Ошибка получения количества непрочитанных:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения количества непрочитанных',
            error: error.message
        });
    }
};

// Получение статистики уведомлений
const getNotificationStats = async (req, res) => {
    try {
        const stats = await Notification.getNotificationStats(req.user.id);
        
        res.json({
            success: true,
            data: stats[0] || {
                total: 0,
                unread: 0,
                archived: 0,
                urgent: 0,
                actionRequired: 0
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
};

// Отметить уведомление как прочитанное
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Уведомление не найдено'
            });
        }

        // Проверяем права доступа
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этому уведомлению'
            });
        }

        await notification.markAsRead();

        res.json({
            success: true,
            message: 'Уведомление отмечено как прочитанное',
            data: notification
        });

    } catch (error) {
        console.error('Ошибка отметки как прочитанное:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка отметки как прочитанное',
            error: error.message
        });
    }
};

// Отметить уведомление как непрочитанное
const markAsUnread = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Уведомление не найдено'
            });
        }

        // Проверяем права доступа
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этому уведомлению'
            });
        }

        await notification.markAsUnread();

        res.json({
            success: true,
            message: 'Уведомление отмечено как непрочитанное',
            data: notification
        });

    } catch (error) {
        console.error('Ошибка отметки как непрочитанное:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка отметки как непрочитанное',
            error: error.message
        });
    }
};

// Отметить все уведомления как прочитанные
const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.markAllAsRead(req.user.id);

        res.json({
            success: true,
            message: `Отмечено как прочитанные: ${result.modifiedCount} уведомлений`,
            data: { modifiedCount: result.modifiedCount }
        });

    } catch (error) {
        console.error('Ошибка отметки всех как прочитанные:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка отметки всех как прочитанные',
            error: error.message
        });
    }
};

// Архивировать уведомление
const archiveNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Уведомление не найдено'
            });
        }

        // Проверяем права доступа
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этому уведомлению'
            });
        }

        await notification.archive();

        res.json({
            success: true,
            message: 'Уведомление архивировано',
            data: notification
        });

    } catch (error) {
        console.error('Ошибка архивирования:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка архивирования',
            error: error.message
        });
    }
};

// Разархивировать уведомление
const unarchiveNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Уведомление не найдено'
            });
        }

        // Проверяем права доступа
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этому уведомлению'
            });
        }

        await notification.unarchive();

        res.json({
            success: true,
            message: 'Уведомление разархивировано',
            data: notification
        });

    } catch (error) {
        console.error('Ошибка разархивирования:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка разархивирования',
            error: error.message
        });
    }
};

// Удалить уведомление
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Уведомление не найдено'
            });
        }

        // Проверяем права доступа
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этому уведомлению'
            });
        }

        await Notification.findByIdAndDelete(notificationId);

        res.json({
            success: true,
            message: 'Уведомление удалено'
        });

    } catch (error) {
        console.error('Ошибка удаления уведомления:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления уведомления',
            error: error.message
        });
    }
};

// Массовые операции с уведомлениями
const bulkOperations = async (req, res) => {
    try {
        const { operation, notificationIds } = req.body;

        if (!operation || !notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать операцию и массив ID уведомлений'
            });
        }

        // Проверяем, что все уведомления принадлежат пользователю
        const notifications = await Notification.find({
            _id: { $in: notificationIds },
            recipient: req.user.id
        });

        if (notifications.length !== notificationIds.length) {
            return res.status(403).json({
                success: false,
                message: 'Некоторые уведомления не найдены или нет доступа'
            });
        }

        let result;
        switch (operation) {
            case 'markAsRead':
                result = await Notification.updateMany(
                    { _id: { $in: notificationIds }, recipient: req.user.id },
                    { isRead: true, readAt: new Date() }
                );
                break;
            case 'markAsUnread':
                result = await Notification.updateMany(
                    { _id: { $in: notificationIds }, recipient: req.user.id },
                    { isRead: false, $unset: { readAt: 1 } }
                );
                break;
            case 'archive':
                result = await Notification.updateMany(
                    { _id: { $in: notificationIds }, recipient: req.user.id },
                    { isArchived: true, archivedAt: new Date() }
                );
                break;
            case 'unarchive':
                result = await Notification.updateMany(
                    { _id: { $in: notificationIds }, recipient: req.user.id },
                    { isArchived: false, $unset: { archivedAt: 1 } }
                );
                break;
            case 'delete':
                result = await Notification.deleteMany({
                    _id: { $in: notificationIds },
                    recipient: req.user.id
                });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Неизвестная операция'
                });
        }

        res.json({
            success: true,
            message: `Операция "${operation}" выполнена для ${result.modifiedCount || result.deletedCount} уведомлений`,
            data: result
        });

    } catch (error) {
        console.error('Ошибка массовой операции:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка массовой операции',
            error: error.message
        });
    }
};

// Создание уведомления (только для админов)
const createNotification = async (req, res) => {
    try {
        const {
            recipients, // массив объектов { id, model }
            type,
            title,
            message,
            priority = 'medium',
            actionRequired = false,
            actionUrl,
            expiresAt,
            category = 'general',
            tags = [],
            data = {}
        } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать получателей'
            });
        }

        const notificationData = {
            sender: req.user.id,
            senderModel: 'admin',
            type,
            title,
            message,
            priority,
            actionRequired,
            actionUrl,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            category,
            tags,
            data
        };

        const notifications = await Notification.createBulkNotifications(recipients, notificationData);

        // Отправляем уведомления через Socket.IO
        const io = req.app.get('io');
        recipients.forEach(recipient => {
            io.to(`notifications_${recipient.id}`).emit('new-notification', {
                type,
                title,
                message,
                priority
            });
        });

        res.status(201).json({
            success: true,
            message: `Создано ${notifications.length} уведомлений`,
            data: notifications
        });

    } catch (error) {
        console.error('Ошибка создания уведомления:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка создания уведомления',
            error: error.message
        });
    }
};

// Получение конкретного уведомления
const getNotificationById = async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId)
            .populate('sender', 'name email');

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Уведомление не найдено'
            });
        }

        // Проверяем права доступа
        if (notification.recipient.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этому уведомлению'
            });
        }

        res.json({
            success: true,
            data: notification
        });

    } catch (error) {
        console.error('Ошибка получения уведомления:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения уведомления',
            error: error.message
        });
    }
};

module.exports = {
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
}; 