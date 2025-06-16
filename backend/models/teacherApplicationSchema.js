const mongoose = require("mongoose");

const teacherApplicationSchema = new mongoose.Schema({
    // Личная информация
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Kazakhstan' }
    },
    
    // Образование и квалификация
    education: [{
        degree: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        specialization: String
    }],
    
    // Опыт работы
    experience: [{
        position: String,
        institution: String,
        startDate: Date,
        endDate: Date,
        description: String,
        isCurrent: { type: Boolean, default: false }
    }],
    
    // Предпочитаемые предметы для преподавания
    preferredSubjects: [{
        type: String,
        required: true
    }],
    
    // Предпочитаемые классы
    preferredClasses: [{
        type: String
    }],
    
    // Дополнительные навыки
    skills: [String],
    
    // Языки
    languages: [{
        language: String,
        level: {
            type: String,
            enum: ['Начальный', 'Средний', 'Продвинутый', 'Родной']
        }
    }],
    
    // Мотивационное письмо
    motivationLetter: {
        type: String,
        required: true,
        maxlength: 2000
    },
    
    // Документы (ссылки на файлы)
    documents: {
        resume: String,
        diploma: String,
        certificates: [String],
        photo: String
    },
    
    // Статус заявки
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'interview_scheduled'],
        default: 'pending'
    },
    
    // Комментарии администратора
    adminComments: [{
        comment: String,
        date: { type: Date, default: Date.now },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin'
        }
    }],
    
    // Школа, в которую подается заявка
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    
    // Дата подачи заявки
    applicationDate: {
        type: Date,
        default: Date.now
    },
    
    // Дата рассмотрения
    reviewDate: Date,
    
    // Назначенные предметы (после одобрения)
    assignedSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject'
    }],
    
    // Назначенные классы (после одобрения)
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass'
    }],
    
    // Зарплата (после одобрения)
    salary: {
        amount: Number,
        currency: { type: String, default: 'KZT' },
        period: { type: String, enum: ['monthly', 'hourly'], default: 'monthly' }
    },
    
    // Дата начала работы (после одобрения)
    startDate: Date,
    
    // Ссылка на созданного учителя (после одобрения)
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher'
    }
}, { 
    timestamps: true 
});

// Индексы для быстрого поиска
teacherApplicationSchema.index({ email: 1 });
teacherApplicationSchema.index({ status: 1 });
teacherApplicationSchema.index({ school: 1 });
teacherApplicationSchema.index({ applicationDate: -1 });

module.exports = mongoose.model("teacherApplication", teacherApplicationSchema); 