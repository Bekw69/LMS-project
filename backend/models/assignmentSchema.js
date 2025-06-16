const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['VSK1', 'VSK2', 'FINAL', 'HOMEWORK', 'PROJECT'],
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    questions: [{
        question: {
            type: String,
            required: true,
        },
        options: [{
            text: String,
            isCorrect: Boolean
        }],
        points: {
            type: Number,
            default: 1
        },
        questionType: {
            type: String,
            enum: ['multiple_choice', 'true_false', 'text'],
            default: 'multiple_choice'
        }
    }],
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number, // в минутах
        required: true,
    },
    maxAttempts: {
        type: Number,
        default: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    totalPoints: {
        type: Number,
        default: 0,
    },
    autoGrade: {
        type: Boolean,
        default: true,
    },
    attachments: [{
        fileName: String,
        filePath: String,
        fileType: String,
    }]
}, { timestamps: true });

// Автоматический расчет общих баллов
assignmentSchema.pre('save', function(next) {
    if (this.questions && this.questions.length > 0) {
        this.totalPoints = this.questions.reduce((sum, question) => sum + question.points, 0);
    }
    next();
});

module.exports = mongoose.model("assignment", assignmentSchema); 