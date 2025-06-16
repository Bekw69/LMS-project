const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNum: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: {
        type: String,
        default: "Student"
    },
    
    // Дополнительные поля из регистрации
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    gender: {
        type: String,
        enum: ['Мужской', 'Женский', 'Другой'],
        required: false
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Kazakhstan' }
    },
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
    
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
                default: 0
            }
        }
    ],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: true
        },
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        }
    }]
}, { 
    timestamps: true 
});

module.exports = mongoose.model("student", studentSchema);