const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const StudentRegistration = require('../models/studentRegistrationSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Admin = require('../models/adminSchema.js');

// Подача заявки на регистрацию студента
const submitStudentRegistration = async (req, res) => {
    try {
        const {
            name, email, phone, dateOfBirth, gender, address,
            parentInfo, previousEducation, selectedClass, selectedSubjects,
            schedulePreferences, extracurricularActivities, specialNeeds,
            languagePreferences, documents, school
        } = req.body;

        // Проверяем существование email
        const existingRegistration = await StudentRegistration.findOne({ email });
        if (existingRegistration) {
            return res.status(400).json({ message: 'Студент с таким email уже подавал заявку' });
        }

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Студент с таким email уже зарегистрирован' });
        }

        // Проверяем существование класса
        const classExists = await Sclass.findById(selectedClass);
        if (!classExists) {
            return res.status(400).json({ message: 'Выбранный класс не найден' });
        }

        // Проверяем существование выбранных предметов
        const subjectIds = selectedSubjects.map(s => s.subject);
        const subjectsExist = await Subject.find({ _id: { $in: subjectIds } });
        if (subjectsExist.length !== subjectIds.length) {
            return res.status(400).json({ message: 'Некоторые выбранные предметы не найдены' });
        }

        // Создаем новую заявку
        const newRegistration = new StudentRegistration({
            name, email, phone, dateOfBirth, gender, address,
            parentInfo, previousEducation, selectedClass, selectedSubjects,
            schedulePreferences, extracurricularActivities, specialNeeds,
            languagePreferences, documents, school,
            status: 'pending'
        });

        const savedRegistration = await newRegistration.save();

        res.status(201).json({
            message: 'Заявка на регистрацию успешно подана',
            registration: savedRegistration
        });

    } catch (error) {
        console.error('Ошибка при подаче заявки:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

// Получение всех заявок на регистрацию для школы
const getStudentRegistrations = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        let query = { school: schoolId };
        if (status) {
            query.status = status;
        }

        const registrations = await StudentRegistration.find(query)
            .populate('selectedClass', 'sclassName')
            .populate('selectedSubjects.subject', 'subName')
            .populate('school', 'schoolName')
            .sort({ registrationDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await StudentRegistration.countDocuments(query);

        res.status(200).json({
            registrations,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error('Ошибка при получении заявок:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

// Получение детальной информации о заявке
const getRegistrationDetail = async (req, res) => {
    try {
        const { registrationId } = req.params;

        const registration = await StudentRegistration.findById(registrationId)
            .populate('selectedClass', 'sclassName')
            .populate('selectedSubjects.subject', 'subName')
            .populate('school', 'schoolName')
            .populate('adminComments.adminId', 'name');

        if (!registration) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        res.status(200).json(registration);

    } catch (error) {
        console.error('Ошибка при получении деталей заявки:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

// Обновление статуса заявки
const updateRegistrationStatus = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { status, adminComment, adminId } = req.body;

        const registration = await StudentRegistration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        registration.status = status;
        registration.reviewDate = new Date();

        if (adminComment) {
            registration.adminComments.push({
                comment: adminComment,
                adminId: adminId
            });
        }

        await registration.save();

        res.status(200).json({
            message: 'Статус заявки обновлен',
            registration
        });

    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

// Генерация расписания для студента
const generateSchedule = async (req, res) => {
    try {
        const { registrationId } = req.params;

        const registration = await StudentRegistration.findById(registrationId)
            .populate('selectedSubjects.subject')
            .populate('selectedClass');

        if (!registration) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        // Получаем всех учителей для выбранных предметов
        const subjectIds = registration.selectedSubjects.map(s => s.subject._id);
        const teachers = await Teacher.find({ 
            teachSubject: { $in: subjectIds }
        }).populate('teachSubject');

        // Время уроков
        const timeSlots = [
            { start: '08:00', end: '08:45' },
            { start: '08:55', end: '09:40' },
            { start: '09:50', end: '10:35' },
            { start: '10:50', end: '11:35' },
            { start: '11:45', end: '12:30' },
            { start: '13:30', end: '14:15' },
            { start: '14:25', end: '15:10' },
            { start: '15:20', end: '16:05' }
        ];

        // Дни недели из предпочтений или по умолчанию
        const daysOfWeek = registration.schedulePreferences.preferredDays.length > 0 
            ? registration.schedulePreferences.preferredDays 
            : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

        // Максимум уроков в день
        const maxHoursPerDay = registration.schedulePreferences.maxHoursPerDay || 6;

        // Генерируем расписание
        const schedule = [];
        let subjectIndex = 0;
        const subjectsCount = registration.selectedSubjects.length;

        for (const day of daysOfWeek) {
            const daySchedule = {
                day: day,
                timeSlots: []
            };

            const hoursForDay = Math.min(maxHoursPerDay, subjectsCount);
            
            for (let hour = 0; hour < hoursForDay; hour++) {
                if (subjectIndex >= subjectsCount) {
                    subjectIndex = 0; // Начинаем заново для равномерного распределения
                }

                const selectedSubject = registration.selectedSubjects[subjectIndex];
                const subject = selectedSubject.subject;
                
                // Находим учителя для данного предмета
                const availableTeacher = teachers.find(teacher => 
                    teacher.teachSubject.some(subj => subj._id.toString() === subject._id.toString())
                );

                if (availableTeacher && timeSlots[hour]) {
                    daySchedule.timeSlots.push({
                        startTime: timeSlots[hour].start,
                        endTime: timeSlots[hour].end,
                        subject: subject._id,
                        teacher: availableTeacher._id,
                        room: `Кабинет ${Math.floor(Math.random() * 20) + 1}`,
                        type: 'Лекция'
                    });
                }

                subjectIndex++;
            }

            if (daySchedule.timeSlots.length > 0) {
                schedule.push(daySchedule);
            }
        }

        // Сохраняем сгенерированное расписание
        registration.generatedSchedule = schedule;
        await registration.save();

        res.status(200).json({
            message: 'Расписание успешно сгенерировано',
            schedule: schedule
        });

    } catch (error) {
        console.error('Ошибка при генерации расписания:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

// Создание студента из одобренной заявки
const createStudentFromRegistration = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { rollNumber, adminId } = req.body;

        const registration = await StudentRegistration.findById(registrationId)
            .populate('selectedClass')
            .populate('selectedSubjects.subject');

        if (!registration) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        if (registration.status !== 'approved') {
            return res.status(400).json({ message: 'Заявка должна быть одобрена' });
        }

        // Проверяем уникальность номера студента
        const existingStudent = await Student.findOne({ 
            rollNum: rollNumber, 
            school: registration.school 
        });
        
        if (existingStudent) {
            return res.status(400).json({ message: 'Студент с таким номером уже существует' });
        }

        // Генерируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rollNumber.toString(), salt);

        // Создаем студента
        const newStudent = new Student({
            name: registration.name,
            rollNum: rollNumber,
            password: hashedPassword,
            sclassName: registration.selectedClass,
            school: registration.school,
            email: registration.email,
            phone: registration.phone,
            dateOfBirth: registration.dateOfBirth,
            gender: registration.gender,
            address: registration.address,
            parentInfo: registration.parentInfo
        });

        const savedStudent = await newStudent.save();

        // Обновляем заявку
        registration.status = 'enrolled';
        registration.enrollmentDate = new Date();
        registration.assignedRollNumber = rollNumber;
        registration.studentId = savedStudent._id;
        
        registration.adminComments.push({
            comment: 'Студент успешно зарегистрирован в системе',
            adminId: adminId
        });

        await registration.save();

        res.status(201).json({
            message: 'Студент успешно создан',
            student: savedStudent,
            registration: registration
        });

    } catch (error) {
        console.error('Ошибка при создании студента:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

// Отклонение заявки
const rejectRegistration = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { reason, adminId } = req.body;

        const registration = await StudentRegistration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        registration.status = 'rejected';
        registration.reviewDate = new Date();
        
        registration.adminComments.push({
            comment: reason || 'Заявка отклонена',
            adminId: adminId
        });

        await registration.save();

        res.status(200).json({
            message: 'Заявка отклонена',
            registration
        });

    } catch (error) {
        console.error('Ошибка при отклонении заявки:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

// Получение статистики заявок
const getRegistrationStats = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const stats = await StudentRegistration.aggregate([
            { $match: { school: mongoose.Types.ObjectId(schoolId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await StudentRegistration.countDocuments({ school: schoolId });

        res.status(200).json({
            stats,
            total
        });

    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    submitStudentRegistration,
    getStudentRegistrations,
    getRegistrationDetail,
    updateRegistrationStatus,
    generateSchedule,
    createStudentFromRegistration,
    rejectRegistration,
    getRegistrationStats
}; 