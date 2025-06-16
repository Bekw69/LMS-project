const mongoose = require('mongoose');

const teacherRequestSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    requestType: {
        type: String,
        enum: ['schedule_change', 'new_subject', 'class_replacement', 'leave_request', 'resource_request', 'other'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'in_review'],
        default: 'pending'
    },
    requestData: {
        // Для изменения расписания
        scheduleChange: {
            currentSchedule: {
                day: String,
                time: String,
                subject: String,
                class: String
            },
            proposedSchedule: {
                day: String,
                time: String,
                subject: String,
                class: String
            }
        },
        // Для нового предмета
        newSubject: {
            subjectName: String,
            subjectCode: String,
            sessions: Number,
            targetClass: String
        },
        // Для замены занятий
        classReplacement: {
            originalDate: Date,
            replacementDate: Date,
            subject: String,
            class: String,
            reason: String
        },
        // Для отпуска
        leaveRequest: {
            startDate: Date,
            endDate: Date,
            reason: String,
            leaveType: {
                type: String,
                enum: ['sick', 'personal', 'vacation', 'emergency']
            }
        },
        // Для запроса ресурсов
        resourceRequest: {
            resourceType: String,
            quantity: Number,
            purpose: String,
            urgency: String
        }
    },
    adminResponse: {
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin'
        },
        responseDate: Date,
        responseMessage: String,
        additionalNotes: String
    },
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    dueDate: Date,
    tags: [String],
    isUrgent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Индексы для оптимизации запросов
teacherRequestSchema.index({ teacher: 1, status: 1 });
teacherRequestSchema.index({ requestType: 1, status: 1 });
teacherRequestSchema.index({ createdAt: -1 });
teacherRequestSchema.index({ priority: 1, status: 1 });

// Middleware для обновления updatedAt
teacherRequestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Виртуальное поле для определения просроченных заявок
teacherRequestSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate) return false;
    return this.dueDate < new Date() && this.status === 'pending';
});

// Методы схемы
teacherRequestSchema.methods.approve = function(adminId, responseMessage) {
    this.status = 'approved';
    this.adminResponse.respondedBy = adminId;
    this.adminResponse.responseDate = new Date();
    this.adminResponse.responseMessage = responseMessage;
    return this.save();
};

teacherRequestSchema.methods.reject = function(adminId, responseMessage) {
    this.status = 'rejected';
    this.adminResponse.respondedBy = adminId;
    this.adminResponse.responseDate = new Date();
    this.adminResponse.responseMessage = responseMessage;
    return this.save();
};

teacherRequestSchema.methods.setInReview = function(adminId) {
    this.status = 'in_review';
    this.adminResponse.respondedBy = adminId;
    this.adminResponse.responseDate = new Date();
    return this.save();
};

// Статические методы
teacherRequestSchema.statics.getRequestsByTeacher = function(teacherId, status = null) {
    const query = { teacher: teacherId };
    if (status) query.status = status;
    return this.find(query).populate('teacher', 'name email').sort({ createdAt: -1 });
};

teacherRequestSchema.statics.getPendingRequests = function() {
    return this.find({ status: 'pending' })
        .populate('teacher', 'name email')
        .sort({ priority: 1, createdAt: -1 });
};

teacherRequestSchema.statics.getRequestsByType = function(requestType) {
    return this.find({ requestType })
        .populate('teacher', 'name email')
        .populate('adminResponse.respondedBy', 'name email')
        .sort({ createdAt: -1 });
};

module.exports = mongoose.model('TeacherRequest', teacherRequestSchema); 