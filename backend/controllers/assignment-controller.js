const Assignment = require('../models/assignmentSchema.js');
const AssignmentSubmission = require('../models/assignmentSubmissionSchema.js');
const Student = require('../models/studentSchema.js');

// Создание нового задания
const createAssignment = async (req, res) => {
    try {
        const assignment = new Assignment(req.body);
        await assignment.save();
        res.status(201).json({
            success: true,
            message: 'Задание успешно создано',
            data: assignment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Получение всех заданий для учителя/предмета/класса
const getAssignments = async (req, res) => {
    try {
        const { teacherId, subjectId, sclassId, type } = req.query;
        
        let filter = {};
        if (teacherId) filter.teacher = teacherId;
        if (subjectId) filter.subject = subjectId;
        if (sclassId) filter.sclass = sclassId;
        if (type) filter.type = type;

        const assignments = await Assignment.find(filter)
            .populate('subject', 'subName subCode')
            .populate('sclass', 'sclassName')
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Получение конкретного задания с подробностями
const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('subject', 'subName subCode')
            .populate('sclass', 'sclassName')
            .populate('teacher', 'name email');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Задание не найдено'
            });
        }

        // Получаем статистику выполнения
        const submissions = await AssignmentSubmission.find({ assignment: assignment._id });
        const totalStudents = await Student.countDocuments({ sclassName: assignment.sclass });

        const submissionStats = {
            totalSubmissions: submissions.length,
            totalStudents,
            graded: submissions.filter(s => s.graded).length,
            averageScore: submissions.length > 0 
                ? submissions.reduce((acc, s) => acc + s.percentage, 0) / submissions.length 
                : 0
        };

        res.status(200).json({
            success: true,
            data: {
                assignment,
                submissionStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Обновление задания
const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Задание не найдено'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Задание успешно обновлено',
            data: assignment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Удаление задания
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndDelete(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Задание не найдено'
            });
        }

        // Удаляем все связанные отправки
        await AssignmentSubmission.deleteMany({ assignment: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Задание успешно удалено'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Копирование задания (для автоматизации ВСК)
const duplicateAssignment = async (req, res) => {
    try {
        const originalAssignment = await Assignment.findById(req.params.id);
        
        if (!originalAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Исходное задание не найдено'
            });
        }

        const { newTitle, newType, newStartDate, newEndDate } = req.body;

        const duplicatedAssignment = new Assignment({
            ...originalAssignment.toObject(),
            _id: undefined,
            title: newTitle || originalAssignment.title + ' (копия)',
            type: newType || originalAssignment.type,
            startDate: newStartDate || originalAssignment.startDate,
            endDate: newEndDate || originalAssignment.endDate,
            isActive: false, // Новое задание изначально неактивно
            createdAt: undefined,
            updatedAt: undefined
        });

        await duplicatedAssignment.save();

        res.status(201).json({
            success: true,
            message: 'Задание успешно скопировано',
            data: duplicatedAssignment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Получение отправок для конкретного задания
const getAssignmentSubmissions = async (req, res) => {
    try {
        const submissions = await AssignmentSubmission.find({ 
            assignment: req.params.id 
        })
        .populate('student', 'name rollNum email')
        .sort({ submissionDate: -1 });

        res.status(200).json({
            success: true,
            data: submissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Оценка задания
const gradeAssignment = async (req, res) => {
    try {
        const { submissionId, totalScore, feedback } = req.body;
        
        const submission = await AssignmentSubmission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Отправка не найдена'
            });
        }

        submission.totalScore = totalScore;
        submission.feedback = feedback;
        submission.graded = true;
        submission.gradedBy = req.user.id; // Предполагается, что пользователь авторизован
        submission.gradedDate = new Date();
        submission.status = 'graded';

        await submission.save();

        res.status(200).json({
            success: true,
            message: 'Задание успешно оценено',
            data: submission
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Отправка задания студентам
const sendAssignmentToStudents = async (req, res) => {
    try {
        const { assignmentId, studentIds, message, sendNotification = true } = req.body;

        const assignment = await Assignment.findById(assignmentId)
            .populate('subject', 'subName')
            .populate('sclass', 'sclassName');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Задание не найдено'
            });
        }

        // Если не указаны конкретные студенты, отправляем всем студентам класса
        let targetStudents;
        if (studentIds && studentIds.length > 0) {
            targetStudents = await Student.find({ 
                _id: { $in: studentIds },
                sclassName: assignment.sclass 
            });
        } else {
            targetStudents = await Student.find({ sclassName: assignment.sclass });
        }

        if (targetStudents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Не найдены студенты для отправки задания'
            });
        }

        // Создаем записи о назначении задания студентам
        const assignmentNotifications = targetStudents.map(student => ({
            assignment: assignmentId,
            student: student._id,
            sentDate: new Date(),
            message: message || `Новое задание: ${assignment.title}`,
            isRead: false,
            notificationSent: sendNotification
        }));

        // Сохраняем уведомления в базе данных
        const AssignmentNotification = require('../models/assignmentNotificationSchema.js');
        await AssignmentNotification.insertMany(assignmentNotifications);

        // Обновляем статус задания как активное
        assignment.isActive = true;
        assignment.sentToStudents = true;
        assignment.sentDate = new Date();
        await assignment.save();

        // Отправляем email уведомления (если включено)
        if (sendNotification) {
            const nodemailer = require('nodemailer');
            
            // Настройка транспорта для отправки email
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Отправляем email каждому студенту
            const emailPromises = targetStudents.map(student => {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: student.email,
                    subject: `Новое задание: ${assignment.title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2c3e50;">Новое задание</h2>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #3498db; margin-top: 0;">${assignment.title}</h3>
                                <p><strong>Предмет:</strong> ${assignment.subject.subName}</p>
                                <p><strong>Класс:</strong> ${assignment.sclass.sclassName}</p>
                                <p><strong>Тип:</strong> ${assignment.type}</p>
                                <p><strong>Срок сдачи:</strong> ${new Date(assignment.endDate).toLocaleDateString('ru-RU')}</p>
                                ${assignment.description ? `<p><strong>Описание:</strong> ${assignment.description}</p>` : ''}
                                ${message ? `<p><strong>Сообщение от учителя:</strong> ${message}</p>` : ''}
                            </div>
                            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                                <p style="margin: 0;"><strong>Важно:</strong> Войдите в систему для выполнения задания.</p>
                            </div>
                        </div>
                    `
                };

                return transporter.sendMail(mailOptions).catch(err => {
                    console.error(`Ошибка отправки email студенту ${student.email}:`, err);
                });
            });

            await Promise.allSettled(emailPromises);
        }

        res.status(200).json({
            success: true,
            message: `Задание отправлено ${targetStudents.length} студентам`,
            data: {
                assignmentId,
                studentsCount: targetStudents.length,
                sentDate: new Date(),
                notificationsSent: sendNotification
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Получение списка студентов для отправки задания
const getStudentsForAssignment = async (req, res) => {
    try {
        const { sclassId } = req.params;
        
        const students = await Student.find({ sclassName: sclassId })
            .select('name rollNum email')
            .sort({ rollNum: 1 });

        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Получение уведомлений о заданиях для студента
const getStudentAssignmentNotifications = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const AssignmentNotification = require('../models/assignmentNotificationSchema.js');
        const notifications = await AssignmentNotification.find({ 
            student: studentId 
        })
        .populate({
            path: 'assignment',
            populate: {
                path: 'subject',
                select: 'subName'
            }
        })
        .sort({ sentDate: -1 })
        .limit(20);

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Отметка уведомления как прочитанного
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const AssignmentNotification = require('../models/assignmentNotificationSchema.js');
        await AssignmentNotification.findByIdAndUpdate(
            notificationId,
            { isRead: true, readDate: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'Уведомление отмечено как прочитанное'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    duplicateAssignment,
    getAssignmentSubmissions,
    gradeAssignment,
    sendAssignmentToStudents,
    getStudentsForAssignment,
    getStudentAssignmentNotifications,
    markNotificationAsRead
}; 