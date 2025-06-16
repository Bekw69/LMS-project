const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assignment',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    answers: [{
        questionIndex: {
            type: Number,
            required: true,
        },
        answer: {
            type: mongoose.Schema.Types.Mixed, // Может быть строкой или массивом
            required: true,
        },
        isCorrect: {
            type: Boolean,
            default: null,
        },
        points: {
            type: Number,
            default: 0,
        }
    }],
    submissionDate: {
        type: Date,
        default: Date.now,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
    },
    totalScore: {
        type: Number,
        default: 0,
    },
    maxScore: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['started', 'submitted', 'graded', 'late'],
        default: 'started',
    },
    attemptNumber: {
        type: Number,
        default: 1,
    },
    graded: {
        type: Boolean,
        default: false,
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
    },
    gradedDate: {
        type: Date,
    },
    feedback: {
        type: String,
    }
}, { timestamps: true });

// Автоматический расчет процента
assignmentSubmissionSchema.pre('save', function(next) {
    if (this.totalScore && this.maxScore) {
        this.percentage = Math.round((this.totalScore / this.maxScore) * 100);
    }
    next();
});

module.exports = mongoose.model("assignmentSubmission", assignmentSubmissionSchema); 