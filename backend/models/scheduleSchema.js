const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    classroom: {
        type: String,
        required: true,
        trim: true
    },
    isBreak: {
        type: Boolean,
        default: false
    },
    breakType: {
        type: String,
        enum: ['short', 'lunch', 'long'],
        default: null
    }
});

const scheduleSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    academicYear: {
        type: String,
        required: true,
        default: () => {
            const currentYear = new Date().getFullYear();
            return `${currentYear}-${currentYear + 1}`;
        }
    },
    semester: {
        type: String,
        enum: ['first', 'second'],
        required: true
    },
    schedule: {
        monday: [timeSlotSchema],
        tuesday: [timeSlotSchema],
        wednesday: [timeSlotSchema],
        thursday: [timeSlotSchema],
        friday: [timeSlotSchema],
        saturday: [timeSlotSchema],
        sunday: [timeSlotSchema]
    },
    effectiveFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    effectiveTo: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    version: {
        type: Number,
        default: 1
    },
    notes: {
        type: String,
        maxlength: 500
    },
    holidays: [{
        date: Date,
        name: String,
        type: {
            type: String,
            enum: ['national', 'school', 'religious', 'other'],
            default: 'school'
        }
    }],
    specialSchedules: [{
        date: Date,
        reason: String,
        modifiedSchedule: {
            monday: [timeSlotSchema],
            tuesday: [timeSlotSchema],
            wednesday: [timeSlotSchema],
            thursday: [timeSlotSchema],
            friday: [timeSlotSchema],
            saturday: [timeSlotSchema],
            sunday: [timeSlotSchema]
        }
    }]
}, {
    timestamps: true
});

// Индексы для оптимизации
scheduleSchema.index({ class: 1, academicYear: 1, semester: 1 });
scheduleSchema.index({ 'schedule.monday.teacher': 1 });
scheduleSchema.index({ 'schedule.tuesday.teacher': 1 });
scheduleSchema.index({ 'schedule.wednesday.teacher': 1 });
scheduleSchema.index({ 'schedule.thursday.teacher': 1 });
scheduleSchema.index({ 'schedule.friday.teacher': 1 });
scheduleSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

// Middleware для валидации времени
timeSlotSchema.pre('validate', function(next) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);
    
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    if (startMinutes >= endMinutes) {
        next(new Error('Время начала должно быть раньше времени окончания'));
    } else {
        next();
    }
});

// Методы схемы
scheduleSchema.methods.checkTeacherConflict = function(day, timeSlot) {
    const daySchedule = this.schedule[day.toLowerCase()];
    if (!daySchedule) return false;
    
    const newStart = timeSlot.startTime.split(':').map(Number);
    const newEnd = timeSlot.endTime.split(':').map(Number);
    const newStartMinutes = newStart[0] * 60 + newStart[1];
    const newEndMinutes = newEnd[0] * 60 + newEnd[1];
    
    return daySchedule.some(slot => {
        if (slot.teacher.toString() !== timeSlot.teacher.toString()) return false;
        
        const slotStart = slot.startTime.split(':').map(Number);
        const slotEnd = slot.endTime.split(':').map(Number);
        const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
        const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];
        
        // Проверка пересечения времени
        return (newStartMinutes < slotEndMinutes && newEndMinutes > slotStartMinutes);
    });
};

scheduleSchema.methods.checkClassroomConflict = function(day, timeSlot) {
    const daySchedule = this.schedule[day.toLowerCase()];
    if (!daySchedule) return false;
    
    const newStart = timeSlot.startTime.split(':').map(Number);
    const newEnd = timeSlot.endTime.split(':').map(Number);
    const newStartMinutes = newStart[0] * 60 + newStart[1];
    const newEndMinutes = newEnd[0] * 60 + newEnd[1];
    
    return daySchedule.some(slot => {
        if (slot.classroom !== timeSlot.classroom) return false;
        
        const slotStart = slot.startTime.split(':').map(Number);
        const slotEnd = slot.endTime.split(':').map(Number);
        const slotStartMinutes = slotStart[0] * 60 + slotStart[1];
        const slotEndMinutes = slotEnd[0] * 60 + slotEnd[1];
        
        return (newStartMinutes < slotEndMinutes && newEndMinutes > slotStartMinutes);
    });
};

scheduleSchema.methods.addTimeSlot = function(day, timeSlot) {
    if (this.checkTeacherConflict(day, timeSlot)) {
        throw new Error('Конфликт расписания: учитель уже занят в это время');
    }
    
    if (this.checkClassroomConflict(day, timeSlot)) {
        throw new Error('Конфликт расписания: аудитория уже занята в это время');
    }
    
    this.schedule[day.toLowerCase()].push(timeSlot);
    this.schedule[day.toLowerCase()].sort((a, b) => {
        const aStart = a.startTime.split(':').map(Number);
        const bStart = b.startTime.split(':').map(Number);
        const aMinutes = aStart[0] * 60 + aStart[1];
        const bMinutes = bStart[0] * 60 + bStart[1];
        return aMinutes - bMinutes;
    });
    
    return this.save();
};

scheduleSchema.methods.getTeacherSchedule = function(teacherId) {
    const teacherSchedule = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
        teacherSchedule[day] = this.schedule[day].filter(slot => 
            slot.teacher.toString() === teacherId.toString()
        );
    });
    
    return teacherSchedule;
};

// Статические методы
scheduleSchema.statics.findActiveSchedule = function(classId, academicYear, semester) {
    return this.findOne({
        class: classId,
        academicYear,
        semester,
        isActive: true,
        effectiveFrom: { $lte: new Date() },
        effectiveTo: { $gte: new Date() }
    }).populate('class')
      .populate('schedule.monday.subject')
      .populate('schedule.monday.teacher')
      .populate('schedule.tuesday.subject')
      .populate('schedule.tuesday.teacher')
      .populate('schedule.wednesday.subject')
      .populate('schedule.wednesday.teacher')
      .populate('schedule.thursday.subject')
      .populate('schedule.thursday.teacher')
      .populate('schedule.friday.subject')
      .populate('schedule.friday.teacher')
      .populate('schedule.saturday.subject')
      .populate('schedule.saturday.teacher')
      .populate('schedule.sunday.subject')
      .populate('schedule.sunday.teacher');
};

scheduleSchema.statics.getTeacherWeeklySchedule = function(teacherId, academicYear, semester) {
    return this.find({
        academicYear,
        semester,
        isActive: true,
        $or: [
            { 'schedule.monday.teacher': teacherId },
            { 'schedule.tuesday.teacher': teacherId },
            { 'schedule.wednesday.teacher': teacherId },
            { 'schedule.thursday.teacher': teacherId },
            { 'schedule.friday.teacher': teacherId },
            { 'schedule.saturday.teacher': teacherId },
            { 'schedule.sunday.teacher': teacherId }
        ]
    }).populate('class')
      .populate('schedule.monday.subject')
      .populate('schedule.tuesday.subject')
      .populate('schedule.wednesday.subject')
      .populate('schedule.thursday.subject')
      .populate('schedule.friday.subject')
      .populate('schedule.saturday.subject')
      .populate('schedule.sunday.subject');
};

module.exports = mongoose.model('Schedule', scheduleSchema); 