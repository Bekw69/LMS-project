const mongoose = require('mongoose');

const studentRegistrationSchema = new mongoose.Schema({
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
    gender: {
        type: String,
        enum: ['Мужской', 'Женский', 'Другой'],
        required: true
    },
    
    // Адрес
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Kazakhstan' }
    },
    
    // Информация о родителях/опекунах
    parentInfo: {
        fatherName: String,
        fatherPhone: String,
        fatherEmail: String,
        fatherOccupation: String,
        motherName: String,
        motherPhone: String,
        motherEmail: String,
        motherOccupation: String,
        guardianName: String,
        guardianPhone: String,
        guardianEmail: String,
        guardianRelation: String
    },
    
    // Предыдущее образование
    previousEducation: {
        schoolName: String,
        graduationYear: Number,
        grade: String,
        certificates: [String] // Ссылки на файлы
    },
    
    // Выбранный класс
    selectedClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    
    // Выбранные предметы для изучения
    selectedSubjects: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        },
        priority: {
            type: Number,
            min: 1,
            max: 5,
            default: 3
        },
        reason: String // Почему выбрал этот предмет
    }],
    
    // Предпочтения по расписанию
    schedulePreferences: {
        preferredStartTime: {
            type: String,
            enum: ['08:00', '09:00', '10:00'],
            default: '08:00'
        },
        preferredDays: [{
            type: String,
            enum: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
        }],
        maxHoursPerDay: {
            type: Number,
            min: 4,
            max: 8,
            default: 6
        },
        breakPreferences: {
            lunchBreak: { type: Boolean, default: true },
            shortBreaks: { type: Boolean, default: true }
        }
    },
    
    // Дополнительные активности
    extracurricularActivities: [{
        activity: String,
        level: {
            type: String,
            enum: ['Начинающий', 'Средний', 'Продвинутый']
        },
        timeCommitment: String // например, "2 часа в неделю"
    }],
    
    // Особые потребности
    specialNeeds: {
        hasDisability: { type: Boolean, default: false },
        disabilityDescription: String,
        accommodationsNeeded: [String],
        medicalConditions: [String],
        allergies: [String],
        dietaryRestrictions: [String]
    },
    
    // Языковые предпочтения
    languagePreferences: {
        primaryLanguage: {
            type: String,
            default: 'Русский'
        },
        secondaryLanguages: [String],
        needsLanguageSupport: { type: Boolean, default: false }
    },
    
    // Документы
    documents: {
        photo: String,
        birthCertificate: String,
        previousSchoolRecords: String,
        medicalRecords: String,
        parentIdCopies: [String],
        otherDocuments: [String]
    },
    
    // Статус регистрации
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'enrolled'],
        default: 'pending'
    },
    
    // Школа
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    
    // Сгенерированное расписание (после одобрения)
    generatedSchedule: [{
        day: {
            type: String,
            enum: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
        },
        timeSlots: [{
            startTime: String,
            endTime: String,
            subject: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject'
            },
            teacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'teacher'
            },
            room: String,
            type: {
                type: String,
                enum: ['Лекция', 'Практика', 'Лабораторная', 'Семинар'],
                default: 'Лекция'
            }
        }]
    }],
    
    // Назначенный номер студента (после одобрения)
    assignedRollNumber: Number,
    
    // Комментарии администратора
    adminComments: [{
        comment: String,
        date: { type: Date, default: Date.now },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin'
        }
    }],
    
    // Даты
    registrationDate: {
        type: Date,
        default: Date.now
    },
    reviewDate: Date,
    enrollmentDate: Date,
    
    // Ссылка на созданного студента (после одобрения)
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    },
    
    // Плата за обучение
    tuitionInfo: {
        totalFee: Number,
        paidAmount: { type: Number, default: 0 },
        paymentPlan: {
            type: String,
            enum: ['full', 'monthly', 'quarterly', 'semester'],
            default: 'monthly'
        },
        scholarshipApplied: { type: Boolean, default: false },
        scholarshipAmount: { type: Number, default: 0 }
    }
}, { 
    timestamps: true 
});

// Индексы
studentRegistrationSchema.index({ email: 1 });
studentRegistrationSchema.index({ status: 1 });
studentRegistrationSchema.index({ school: 1 });
studentRegistrationSchema.index({ selectedClass: 1 });
studentRegistrationSchema.index({ registrationDate: -1 });

// Виртуальное поле для полного имени родителя
studentRegistrationSchema.virtual('primaryParentContact').get(function() {
    if (this.parentInfo.fatherName && this.parentInfo.fatherPhone) {
        return {
            name: this.parentInfo.fatherName,
            phone: this.parentInfo.fatherPhone,
            email: this.parentInfo.fatherEmail
        };
    } else if (this.parentInfo.motherName && this.parentInfo.motherPhone) {
        return {
            name: this.parentInfo.motherName,
            phone: this.parentInfo.motherPhone,
            email: this.parentInfo.motherEmail
        };
    } else if (this.parentInfo.guardianName && this.parentInfo.guardianPhone) {
        return {
            name: this.parentInfo.guardianName,
            phone: this.parentInfo.guardianPhone,
            email: this.parentInfo.guardianEmail
        };
    }
    return null;
});

module.exports = mongoose.model("studentRegistration", studentRegistrationSchema); 