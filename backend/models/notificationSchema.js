const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['admin', 'teacher', 'student']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        enum: ['admin', 'teacher', 'student', 'system']
    },
    type: {
        type: String,
        enum: [
            'grade_update',
            'attendance_update', 
            'teacher_request_status',
            'new_teacher_request',
            'schedule_change',
            'new_assignment',
            'assignment_due',
            'system_announcement',
            'account_created',
            'password_reset',
            'class_cancelled',
            'exam_scheduled',
            'fee_reminder',
            'general'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    data: {
        // Дополнительные данные в зависимости от типа уведомления
        gradeUpdate: {
            subject: String,
            grade: Number,
            maxGrade: Number,
            examType: String
        },
        attendanceUpdate: {
            subject: String,
            date: Date,
            status: String
        },
        teacherRequestStatus: {
            requestId: mongoose.Schema.Types.ObjectId,
            requestType: String,
            status: String,
            adminResponse: String
        },
        scheduleChange: {
            classId: mongoose.Schema.Types.ObjectId,
            date: Date,
            changes: [{
                field: String,
                oldValue: String,
                newValue: String
            }]
        },
        assignment: {
            assignmentId: mongoose.Schema.Types.ObjectId,
            subject: String,
            dueDate: Date
        },
        exam: {
            examId: mongoose.Schema.Types.ObjectId,
            subject: String,
            examDate: Date,
            duration: Number
        }
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedAt: Date,
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionUrl: String, // URL для перехода к связанному действию
    expiresAt: Date, // Дата истечения уведомления
    category: {
        type: String,
        enum: ['academic', 'administrative', 'personal', 'system'],
        default: 'general'
    },
    tags: [String],
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number
    }]
}, {
    timestamps: true
});

// Индексы для оптимизации
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 });

// TTL индекс для автоматического удаления истекших уведомлений
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Middleware для установки времени прочтения
notificationSchema.pre('save', function(next) {
    if (this.isModified('isRead') && this.isRead && !this.readAt) {
        this.readAt = new Date();
    }
    if (this.isModified('isArchived') && this.isArchived && !this.archivedAt) {
        this.archivedAt = new Date();
    }
    next();
});

// Методы схемы
notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

notificationSchema.methods.markAsUnread = function() {
    this.isRead = false;
    this.readAt = undefined;
    return this.save();
};

notificationSchema.methods.archive = function() {
    this.isArchived = true;
    this.archivedAt = new Date();
    return this.save();
};

notificationSchema.methods.unarchive = function() {
    this.isArchived = false;
    this.archivedAt = undefined;
    return this.save();
};

// Статические методы
notificationSchema.statics.getUnreadCount = function(recipientId) {
    return this.countDocuments({
        recipient: recipientId,
        isRead: false,
        isArchived: false
    });
};

notificationSchema.statics.getNotificationsByRecipient = function(recipientId, options = {}) {
    const {
        page = 1,
        limit = 20,
        type = null,
        priority = null,
        isRead = null,
        isArchived = false
    } = options;

    const query = {
        recipient: recipientId,
        isArchived
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (isRead !== null) query.isRead = isRead;

    return this.find(query)
        .populate('sender', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
};

notificationSchema.statics.markAllAsRead = function(recipientId) {
    return this.updateMany(
        { recipient: recipientId, isRead: false },
        { 
            isRead: true, 
            readAt: new Date() 
        }
    );
};

notificationSchema.statics.createNotification = function(notificationData) {
    const notification = new this(notificationData);
    return notification.save();
};

notificationSchema.statics.createBulkNotifications = function(recipients, notificationData) {
    const notifications = recipients.map(recipient => ({
        ...notificationData,
        recipient: recipient.id,
        recipientModel: recipient.model
    }));
    
    return this.insertMany(notifications);
};

notificationSchema.statics.getNotificationStats = function(recipientId) {
    return this.aggregate([
        { $match: { recipient: mongoose.Types.ObjectId(recipientId) } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                unread: {
                    $sum: {
                        $cond: [{ $eq: ['$isRead', false] }, 1, 0]
                    }
                },
                archived: {
                    $sum: {
                        $cond: [{ $eq: ['$isArchived', true] }, 1, 0]
                    }
                },
                urgent: {
                    $sum: {
                        $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0]
                    }
                },
                actionRequired: {
                    $sum: {
                        $cond: [{ $eq: ['$actionRequired', true] }, 1, 0]
                    }
                }
            }
        }
    ]);
};

// Виртуальные поля
notificationSchema.virtual('isExpired').get(function() {
    return this.expiresAt && this.expiresAt < new Date();
});

notificationSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diff = now - this.createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return 'Только что';
});

module.exports = mongoose.model('Notification', notificationSchema); 