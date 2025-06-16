const mongoose = require('mongoose');

const assignmentNotificationSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    sentDate: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readDate: {
        type: Date
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Индексы для оптимизации запросов
assignmentNotificationSchema.index({ student: 1, sentDate: -1 });
assignmentNotificationSchema.index({ assignment: 1 });
assignmentNotificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('assignmentNotification', assignmentNotificationSchema); 