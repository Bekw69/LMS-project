const bcrypt = require('bcrypt');
const TeacherApplication = require('../models/teacherApplicationSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Sclass = require('../models/sclassSchema.js');

// Подача заявки учителем
const submitTeacherApplication = async (req, res) => {
    try {
        const {
            name, email, phone, dateOfBirth, address,
            education, experience, preferredSubjects, preferredClasses,
            skills, languages, motivationLetter, school
        } = req.body;

        // Проверяем, не подавал ли уже заявку этот email
        const existingApplication = await TeacherApplication.findOne({ 
            email, 
            school,
            status: { $in: ['pending', 'under_review', 'approved'] }
        });

        if (existingApplication) {
            return res.status(400).json({ 
                message: 'Заявка с этим email уже существует' 
            });
        }

        const application = new TeacherApplication({
            name, email, phone, dateOfBirth, address,
            education, experience, preferredSubjects, preferredClasses,
            skills, languages, motivationLetter, school
        });

        const result = await application.save();
        res.status(201).json({
            message: 'Заявка успешно подана',
            applicationId: result._id
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Ошибка при подаче заявки',
            error: err.message 
        });
    }
};

// Получение всех заявок для админа
const getTeacherApplications = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { school: schoolId };
        if (status) {
            filter.status = status;
        }

        const applications = await TeacherApplication.find(filter)
            .sort({ applicationDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('school', 'schoolName')
            .populate('assignedSubjects', 'subName')
            .populate('assignedClasses', 'sclassName');

        const total = await TeacherApplication.countDocuments(filter);

        res.json({
            applications,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Ошибка при получении заявок',
            error: err.message 
        });
    }
};

// Получение детальной информации о заявке
const getTeacherApplicationDetail = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await TeacherApplication.findById(applicationId)
            .populate('school', 'schoolName')
            .populate('assignedSubjects', 'subName subCode')
            .populate('assignedClasses', 'sclassName')
            .populate('adminComments.adminId', 'name')
            .populate('teacherId', 'name email');

        if (!application) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        res.json(application);
    } catch (err) {
        res.status(500).json({ 
            message: 'Ошибка при получении заявки',
            error: err.message 
        });
    }
};

// Обновление статуса заявки
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, adminComment, adminId } = req.body;

        const application = await TeacherApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        application.status = status;
        application.reviewDate = new Date();

        if (adminComment) {
            application.adminComments.push({
                comment: adminComment,
                adminId: adminId
            });
        }

        await application.save();

        res.json({
            message: 'Статус заявки обновлен',
            application
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Ошибка при обновлении статуса',
            error: err.message 
        });
    }
};

// Назначение предметов и классов
const assignSubjectsAndClasses = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { subjectIds, classIds, salary, startDate } = req.body;

        const application = await TeacherApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        if (application.status !== 'approved') {
            return res.status(400).json({ 
                message: 'Заявка должна быть одобрена для назначения предметов' 
            });
        }

        application.assignedSubjects = subjectIds;
        application.assignedClasses = classIds;
        application.salary = salary;
        application.startDate = startDate;

        await application.save();

        res.json({
            message: 'Предметы и классы назначены',
            application
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Ошибка при назначении предметов',
            error: err.message 
        });
    }
};

// Создание учителя из одобренной заявки
const createTeacherFromApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { password } = req.body;

        const application = await TeacherApplication.findById(applicationId)
            .populate('assignedSubjects')
            .populate('assignedClasses');

        if (!application) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        if (application.status !== 'approved') {
            return res.status(400).json({ 
                message: 'Заявка должна быть одобрена' 
            });
        }

        if (application.assignedSubjects.length === 0) {
            return res.status(400).json({ 
                message: 'Необходимо назначить хотя бы один предмет' 
            });
        }

        // Проверяем, не создан ли уже учитель
        if (application.teacherId) {
            return res.status(400).json({ 
                message: 'Учитель уже создан для этой заявки' 
            });
        }

        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создаем учителя для каждого назначенного предмета
        const teachers = [];
        
        for (const subject of application.assignedSubjects) {
            // Находим класс для этого предмета
            const subjectClass = application.assignedClasses.find(cls => 
                subject.sclassName.toString() === cls._id.toString()
            );

            if (subjectClass) {
                const teacher = new Teacher({
                    name: application.name,
                    email: application.email,
                    password: hashedPassword,
                    role: "Teacher",
                    school: application.school,
                    teachSubject: subject._id,
                    teachSclass: subjectClass._id
                });

                const savedTeacher = await teacher.save();
                
                // Обновляем предмет, назначая ему учителя
                await Subject.findByIdAndUpdate(subject._id, { 
                    teacher: savedTeacher._id 
                });

                teachers.push(savedTeacher);
            }
        }

        // Обновляем заявку
        application.teacherId = teachers[0]._id; // Основной учитель
        await application.save();

        res.json({
            message: 'Учитель успешно создан',
            teachers: teachers.map(t => ({ ...t.toObject(), password: undefined }))
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Ошибка при создании учителя',
            error: err.message 
        });
    }
};

// Отклонение заявки
const rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { reason, adminId } = req.body;

        const application = await TeacherApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        application.status = 'rejected';
        application.reviewDate = new Date();
        application.adminComments.push({
            comment: `Заявка отклонена. Причина: ${reason}`,
            adminId: adminId
        });

        await application.save();

        res.json({
            message: 'Заявка отклонена',
            application
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Ошибка при отклонении заявки',
            error: err.message 
        });
    }
};

// Получение статистики заявок
const getApplicationsStats = async (req, res) => {
    try {
        const { schoolId } = req.params;

        const stats = await TeacherApplication.aggregate([
            { $match: { school: schoolId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalApplications = await TeacherApplication.countDocuments({ school: schoolId });
        
        const recentApplications = await TeacherApplication.find({ school: schoolId })
            .sort({ applicationDate: -1 })
            .limit(5)
            .select('name email status applicationDate');

        res.json({
            stats,
            totalApplications,
            recentApplications
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Ошибка при получении статистики',
            error: err.message 
        });
    }
};

module.exports = {
    submitTeacherApplication,
    getTeacherApplications,
    getTeacherApplicationDetail,
    updateApplicationStatus,
    assignSubjectsAndClasses,
    createTeacherFromApplication,
    rejectApplication,
    getApplicationsStats
}; 