const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    
    // Основная информация об оценке
    gradeValue: {
        type: Number,
        required: true,
        min: 1,
        max: 5 // Российская система оценок 1-5
    },
    gradeType: {
        type: String,
        enum: ['homework', 'classwork', 'test', 'exam', 'project', 'participation', 'quiz'],
        required: true
    },
    gradeWeight: {
        type: Number,
        default: 1, // Вес оценки для расчета среднего
        min: 0.1,
        max: 5
    },
    
    // Детали задания/работы
    assignmentTitle: {
        type: String,
        required: true,
        trim: true
    },
    assignmentDescription: {
        type: String,
        trim: true
    },
    maxPoints: {
        type: Number,
        default: 5
    },
    earnedPoints: {
        type: Number,
        required: true
    },
    
    // Временные метки
    assignmentDate: {
        type: Date,
        required: true
    },
    submissionDate: {
        type: Date
    },
    gradedDate: {
        type: Date,
        default: Date.now
    },
    
    // Обратная связь
    teacherComment: {
        type: String,
        trim: true
    },
    feedback: {
        strengths: [String],
        improvements: [String],
        recommendations: [String]
    },
    
    // Статус и метаданные
    status: {
        type: String,
        enum: ['draft', 'published', 'revised'],
        default: 'published'
    },
    isLate: {
        type: Boolean,
        default: false
    },
    quarter: {
        type: Number,
        min: 1,
        max: 4,
        required: true
    },
    academicYear: {
        type: String,
        required: true // Формат: "2023-2024"
    },
    
    // Дополнительные поля
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
    
    // Система тегов для категоризации
    tags: [String],
    
    // Связанные оценки (для групповых проектов)
    relatedGrades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'grade'
    }],
    
    // Аналитические данные
    analytics: {
        timeSpent: Number, // Время выполнения в минутах
        attempts: {
            type: Number,
            default: 1
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        }
    }
}, {
    timestamps: true
});

// Индексы для оптимизации запросов
gradeSchema.index({ student: 1, subject: 1, academicYear: 1 });
gradeSchema.index({ teacher: 1, class: 1, gradedDate: -1 });
gradeSchema.index({ school: 1, quarter: 1, academicYear: 1 });
gradeSchema.index({ gradeType: 1, assignmentDate: -1 });

// Виртуальные поля
gradeSchema.virtual('percentage').get(function() {
    return Math.round((this.earnedPoints / this.maxPoints) * 100);
});

gradeSchema.virtual('letterGrade').get(function() {
    const percentage = this.percentage;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
});

gradeSchema.virtual('isExcellent').get(function() {
    return this.gradeValue >= 5;
});

gradeSchema.virtual('isPassing').get(function() {
    return this.gradeValue >= 3;
});

// Методы схемы
gradeSchema.methods.calculateWeightedScore = function() {
    return this.gradeValue * this.gradeWeight;
};

gradeSchema.methods.getDaysLate = function() {
    if (!this.isLate || !this.submissionDate || !this.assignmentDate) return 0;
    const diffTime = this.submissionDate - this.assignmentDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Статические методы
gradeSchema.statics.getStudentAverage = async function(studentId, subjectId, quarter, academicYear) {
    const grades = await this.find({
        student: studentId,
        subject: subjectId,
        quarter: quarter,
        academicYear: academicYear,
        status: 'published'
    });
    
    if (grades.length === 0) return null;
    
    const totalWeightedScore = grades.reduce((sum, grade) => sum + grade.calculateWeightedScore(), 0);
    const totalWeight = grades.reduce((sum, grade) => sum + grade.gradeWeight, 0);
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
};

gradeSchema.statics.getClassAverage = async function(classId, subjectId, quarter, academicYear) {
    const pipeline = [
        {
            $match: {
                class: classId,
                subject: subjectId,
                quarter: quarter,
                academicYear: academicYear,
                status: 'published'
            }
        },
        {
            $group: {
                _id: '$student',
                weightedSum: { $sum: { $multiply: ['$gradeValue', '$gradeWeight'] } },
                totalWeight: { $sum: '$gradeWeight' }
            }
        },
        {
            $project: {
                average: { $divide: ['$weightedSum', '$totalWeight'] }
            }
        },
        {
            $group: {
                _id: null,
                classAverage: { $avg: '$average' }
            }
        }
    ];
    
    const result = await this.aggregate(pipeline);
    return result.length > 0 ? result[0].classAverage : 0;
};

// Middleware
gradeSchema.pre('save', function(next) {
    // Автоматически рассчитываем процент
    if (this.earnedPoints && this.maxPoints) {
        this.gradeValue = Math.round((this.earnedPoints / this.maxPoints) * 5);
    }
    
    // Определяем текущий учебный год, если не указан
    if (!this.academicYear) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        this.academicYear = month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }
    
    // Определяем четверть, если не указана
    if (!this.quarter) {
        const month = new Date().getMonth();
        if (month >= 8 && month <= 10) this.quarter = 1;
        else if (month >= 11 || month <= 0) this.quarter = 2;
        else if (month >= 1 && month <= 3) this.quarter = 3;
        else this.quarter = 4;
    }
    
    next();
});

module.exports = mongoose.model("grade", gradeSchema); 