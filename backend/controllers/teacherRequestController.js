const TeacherRequest = require('../models/teacherRequestSchema');
const Teacher = require('../models/teacherSchema');
const Admin = require('../models/adminSchema');
const Notification = require('../models/notificationSchema');
const multer = require('multer');
const path = require('path');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/teacher-requests/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Недопустимый тип файла'));
        }
    }
});

// Создание новой заявки
const createTeacherRequest = async (req, res) => {
    try {
        const {
            requestType,
            title,
            description,
            priority,
            requestData,
            dueDate,
            tags
        } = req.body;

        // Проверяем, что учитель существует
        const teacher = await Teacher.findById(req.user.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Учитель не найден'
            });
        }

        // Создаем заявку
        const teacherRequest = new TeacherRequest({
            teacher: req.user.id,
            requestType,
            title,
            description,
            priority: priority || 'medium',
            requestData: requestData || {},
            dueDate: dueDate ? new Date(dueDate) : null,
            tags: tags || [],
            isUrgent: priority === 'urgent'
        });

        // Добавляем вложения если есть
        if (req.files && req.files.length > 0) {
            teacherRequest.attachments = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size
            }));
        }

        await teacherRequest.save();

        // Уведомляем всех админов о новой заявке
        const admins = await Admin.find({}, '_id');
        const notifications = admins.map(admin => ({
            recipient: admin._id,
            recipientModel: 'admin',
            sender: req.user.id,
            senderModel: 'teacher',
            type: 'new_teacher_request',
            title: 'Новая заявка от учителя',
            message: `${teacher.name} подал заявку: ${title}`,
            priority: priority || 'medium',
            actionRequired: true,
            actionUrl: `/admin/teacher-requests/${teacherRequest._id}`,
            data: {
                teacherRequestStatus: {
                    requestId: teacherRequest._id,
                    requestType,
                    status: 'pending'
                }
            }
        }));

        await Notification.insertMany(notifications);

        // Отправляем уведомление через Socket.IO
        const io = req.app.get('io');
        admins.forEach(admin => {
            io.to(`notifications_${admin._id}`).emit('new-notification', {
                type: 'new_teacher_request',
                title: 'Новая заявка от учителя',
                message: `${teacher.name} подал заявку: ${title}`,
                requestId: teacherRequest._id
            });
        });

        res.status(201).json({
            success: true,
            message: 'Заявка успешно создана',
            data: teacherRequest
        });

    } catch (error) {
        console.error('Ошибка создания заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка создания заявки',
            error: error.message
        });
    }
};

// Получение заявок учителя
const getTeacherRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, priority } = req.query;
        const teacherId = req.user.role === 'Teacher' ? req.user.id : req.params.teacherId;

        const query = { teacher: teacherId };
        if (status) query.status = status;
        if (type) query.requestType = type;
        if (priority) query.priority = priority;

        const requests = await TeacherRequest.find(query)
            .populate('teacher', 'name email')
            .populate('adminResponse.respondedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await TeacherRequest.countDocuments(query);

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Ошибка получения заявок:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения заявок',
            error: error.message
        });
    }
};

// Получение всех заявок (для админов)
const getAllTeacherRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, priority, teacher } = req.query;

        const query = {};
        if (status) query.status = status;
        if (type) query.requestType = type;
        if (priority) query.priority = priority;
        if (teacher) query.teacher = teacher;

        const requests = await TeacherRequest.find(query)
            .populate('teacher', 'name email')
            .populate('adminResponse.respondedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await TeacherRequest.countDocuments(query);

        // Статистика заявок
        const stats = await TeacherRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                requests,
                stats: stats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {}),
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Ошибка получения всех заявок:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения заявок',
            error: error.message
        });
    }
};

// Получение конкретной заявки
const getTeacherRequestById = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await TeacherRequest.findById(requestId)
            .populate('teacher', 'name email')
            .populate('adminResponse.respondedBy', 'name email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Заявка не найдена'
            });
        }

        // Проверяем права доступа
        if (req.user.role === 'Teacher' && request.teacher._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этой заявке'
            });
        }

        res.json({
            success: true,
            data: request
        });

    } catch (error) {
        console.error('Ошибка получения заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения заявки',
            error: error.message
        });
    }
};

// Обновление заявки (только для учителей и только pending заявки)
const updateTeacherRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const updates = req.body;

        const request = await TeacherRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Заявка не найдена'
            });
        }

        // Проверяем права доступа
        if (request.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этой заявке'
            });
        }

        // Можно редактировать только pending заявки
        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Можно редактировать только заявки в статусе "ожидание"'
            });
        }

        // Обновляем заявку
        Object.assign(request, updates);
        await request.save();

        res.json({
            success: true,
            message: 'Заявка успешно обновлена',
            data: request
        });

    } catch (error) {
        console.error('Ошибка обновления заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления заявки',
            error: error.message
        });
    }
};

// Одобрение заявки (только для админов)
const approveTeacherRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { responseMessage, additionalNotes } = req.body;

        const request = await TeacherRequest.findById(requestId)
            .populate('teacher', 'name email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Заявка не найдена'
            });
        }

        await request.approve(req.user.id, responseMessage);
        if (additionalNotes) {
            request.adminResponse.additionalNotes = additionalNotes;
            await request.save();
        }

        // Уведомляем учителя
        await Notification.create({
            recipient: request.teacher._id,
            recipientModel: 'teacher',
            sender: req.user.id,
            senderModel: 'admin',
            type: 'teacher_request_status',
            title: 'Заявка одобрена',
            message: `Ваша заявка "${request.title}" была одобрена`,
            priority: 'medium',
            data: {
                teacherRequestStatus: {
                    requestId: request._id,
                    requestType: request.requestType,
                    status: 'approved',
                    adminResponse: responseMessage
                }
            }
        });

        // Отправляем уведомление через Socket.IO
        const io = req.app.get('io');
        io.to(`notifications_${request.teacher._id}`).emit('new-notification', {
            type: 'teacher_request_status',
            title: 'Заявка одобрена',
            message: `Ваша заявка "${request.title}" была одобрена`
        });

        res.json({
            success: true,
            message: 'Заявка успешно одобрена',
            data: request
        });

    } catch (error) {
        console.error('Ошибка одобрения заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка одобрения заявки',
            error: error.message
        });
    }
};

// Отклонение заявки (только для админов)
const rejectTeacherRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { responseMessage, additionalNotes } = req.body;

        const request = await TeacherRequest.findById(requestId)
            .populate('teacher', 'name email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Заявка не найдена'
            });
        }

        await request.reject(req.user.id, responseMessage);
        if (additionalNotes) {
            request.adminResponse.additionalNotes = additionalNotes;
            await request.save();
        }

        // Уведомляем учителя
        await Notification.create({
            recipient: request.teacher._id,
            recipientModel: 'teacher',
            sender: req.user.id,
            senderModel: 'admin',
            type: 'teacher_request_status',
            title: 'Заявка отклонена',
            message: `Ваша заявка "${request.title}" была отклонена`,
            priority: 'medium',
            data: {
                teacherRequestStatus: {
                    requestId: request._id,
                    requestType: request.requestType,
                    status: 'rejected',
                    adminResponse: responseMessage
                }
            }
        });

        // Отправляем уведомление через Socket.IO
        const io = req.app.get('io');
        io.to(`notifications_${request.teacher._id}`).emit('new-notification', {
            type: 'teacher_request_status',
            title: 'Заявка отклонена',
            message: `Ваша заявка "${request.title}" была отклонена`
        });

        res.json({
            success: true,
            message: 'Заявка отклонена',
            data: request
        });

    } catch (error) {
        console.error('Ошибка отклонения заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка отклонения заявки',
            error: error.message
        });
    }
};

// Удаление заявки
const deleteTeacherRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await TeacherRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Заявка не найдена'
            });
        }

        // Проверяем права доступа
        if (req.user.role === 'Teacher' && request.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Нет доступа к этой заявке'
            });
        }

        // Учителя могут удалять только pending заявки
        if (req.user.role === 'Teacher' && request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Можно удалять только заявки в статусе "ожидание"'
            });
        }

        await TeacherRequest.findByIdAndDelete(requestId);

        res.json({
            success: true,
            message: 'Заявка успешно удалена'
        });

    } catch (error) {
        console.error('Ошибка удаления заявки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления заявки',
            error: error.message
        });
    }
};

module.exports = {
    createTeacherRequest,
    getTeacherRequests,
    getAllTeacherRequests,
    getTeacherRequestById,
    updateTeacherRequest,
    approveTeacherRequest,
    rejectTeacherRequest,
    deleteTeacherRequest,
    upload
}; 