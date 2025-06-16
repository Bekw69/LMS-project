const Chat = require('../models/chatSchema');
const Student = require('../models/studentSchema');
const Teacher = require('../models/teacherSchema');
const Admin = require('../models/adminSchema');
const Sclass = require('../models/sclassSchema');
const Subject = require('../models/subjectSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка mul ter для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/chat-files/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'video/mp4', 'video/avi', 'video/mov',
            'audio/mpeg', 'audio/wav', 'audio/ogg'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый тип файла'), false);
        }
    }
});

// Создание чата для класса
const createClassChat = async (req, res) => {
    try {
        const { classId, name, description } = req.body;
        const { id: adminId } = req.params;

        // Проверяем существование класса
        const sclass = await Sclass.findById(classId);
        if (!sclass) {
            return res.status(404).json({ message: "Класс не найден" });
        }

        // Проверяем, нет ли уже чата для этого класса
        const existingChat = await Chat.findOne({ class: classId, school: adminId });
        if (existingChat) {
            return res.status(400).json({ message: "Чат для этого класса уже существует" });
        }

        // Получаем всех студентов класса
        const students = await Student.find({ sclassName: classId });
        
        // Получаем учителей, которые ведут предметы в этом классе
        const subjects = await Subject.find({ sclassName: classId }).populate('teacher');
        const teachers = subjects.map(subject => subject.teacher).filter(teacher => teacher);

        // Создаем список участников
        const participants = [];
        
        // Добавляем студентов
        students.forEach(student => {
            participants.push({
                user: student._id,
                userModel: 'Student',
                role: 'member'
            });
        });

        // Добавляем учителей как модераторов
        teachers.forEach(teacher => {
            if (!participants.find(p => p.user.toString() === teacher._id.toString())) {
                participants.push({
                    user: teacher._id,
                    userModel: 'Teacher',
                    role: 'moderator'
                });
            }
        });

        // Добавляем админа как администратора
        participants.push({
            user: adminId,
            userModel: 'Admin',
            role: 'admin'
        });

        // Создаем чат
        const chat = new Chat({
            name: name || `Чат класса ${sclass.sclassName}`,
            description: description || `Общий чат для класса ${sclass.sclassName}`,
            chatType: 'class',
            class: classId,
            participants: participants,
            school: adminId,
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        await chat.save();

        res.status(201).json({
            message: "Чат успешно создан",
            chat: chat
        });

    } catch (error) {
        console.error('Ошибка создания чата:', error);
        res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
    }
};

// Получение чатов пользователя
const getUserChats = async (req, res) => {
    try {
        const { userId, userModel } = req.params;

        const chats = await Chat.find({
            'participants.user': userId,
            'participants.userModel': userModel,
            isActive: true
        })
        .populate('class', 'sclassName')
        .populate('subject', 'subName')
        .sort({ updatedAt: -1 });

        // Добавляем информацию о последнем сообщении и непрочитанных
        const chatsWithInfo = chats.map(chat => {
            const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
            const participant = chat.participants.find(p => 
                p.user.toString() === userId && p.userModel === userModel
            );
            
            let unreadCount = 0;
            if (participant && lastMessage) {
                unreadCount = chat.messages.filter(msg => 
                    msg.createdAt > participant.lastSeen &&
                    !(msg.sender.toString() === userId && msg.senderModel === userModel)
                ).length;
            }

            return {
                ...chat.toObject(),
                lastMessage,
                unreadCount,
                lastSeen: participant ? participant.lastSeen : null
            };
        });

        res.status(200).json(chatsWithInfo);

    } catch (error) {
        console.error('Ошибка получения чатов:', error);
        res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
    }
};

// Получение сообщений чата
const getChatMessages = async (req, res) => {
    try {
        const { chatId, userId, userModel } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Чат не найден" });
        }

        // Проверяем, является ли пользователь участником чата
        const isParticipant = chat.participants.some(p => 
            p.user.toString() === userId && p.userModel === userModel
        );

        if (!isParticipant) {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        // Обновляем время последнего просмотра
        await chat.updateLastSeen(userId, userModel);

        // Получаем сообщения с пагинацией
        const skip = (page - 1) * limit;
        const messages = chat.messages
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(skip, skip + parseInt(limit))
            .reverse();

        res.status(200).json({
            messages,
            totalMessages: chat.messages.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil(chat.messages.length / limit)
        });

    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
    }
};

// Отправка текстового сообщения
const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, senderId, senderModel, senderName, replyTo } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Сообщение не может быть пустым" });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Чат не найден" });
        }

        // Проверяем, является ли отправитель участником чата
        const isParticipant = chat.participants.some(p => 
            p.user.toString() === senderId && p.userModel === senderModel
        );

        if (!isParticipant) {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        const messageData = {
            sender: senderId,
            senderModel: senderModel,
            senderName: senderName,
            content: content.trim(),
            messageType: 'text'
        };

        if (replyTo) {
            messageData.replyTo = replyTo;
        }

        await chat.addMessage(messageData);

        const newMessage = chat.messages[chat.messages.length - 1];

        // Отправляем сообщение через Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(chatId).emit('new-message', newMessage);
        }

        res.status(201).json({
            message: "Сообщение отправлено",
            data: newMessage
        });

    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
    }
};

// Загрузка файла
const uploadFileHandler = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { senderId, senderModel, senderName } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Файл не выбран" });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Чат не найден" });
        }

        // Проверяем, является ли отправитель участником чата
        const isParticipant = chat.participants.some(p => 
            p.user.toString() === senderId && p.userModel === senderModel
        );

        if (!isParticipant) {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        // Определяем тип сообщения по MIME типу
        let messageType = 'file';
        if (req.file.mimetype.startsWith('image/')) {
            messageType = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
            messageType = 'video';
        } else if (req.file.mimetype.startsWith('audio/')) {
            messageType = 'voice';
        } else if (req.file.mimetype.includes('pdf') || req.file.mimetype.includes('document')) {
            messageType = 'document';
        }

        const messageData = {
            sender: senderId,
            senderModel: senderModel,
            senderName: senderName,
            messageType: messageType,
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/chat-files/${req.file.filename}`
            }
        };

        await chat.addMessage(messageData);

        const newMessage = chat.messages[chat.messages.length - 1];

        // Отправляем сообщение через Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(chatId).emit('new-message', newMessage);
        }

        res.status(201).json({
            message: "Файл загружен",
            data: newMessage
        });

    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
    }
};

// Получение информации о чате
const getChatInfo = async (req, res) => {
    try {
        const { chatId, userId, userModel } = req.params;

        const chat = await Chat.findById(chatId)
            .populate('class', 'sclassName')
            .populate('subject', 'subName')
            .populate('participants.user', 'name email rollNum');

        if (!chat) {
            return res.status(404).json({ message: "Чат не найден" });
        }

        // Проверяем, является ли пользователь участником чата
        const isParticipant = chat.participants.some(p => 
            p.user.toString() === userId && p.userModel === userModel
        );

        if (!isParticipant) {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        res.status(200).json(chat);

    } catch (error) {
        console.error('Ошибка получения информации о чате:', error);
        res.status(500).json({ message: "Внутренняя ошибка сервера", error: error.message });
    }
};

module.exports = {
    createClassChat,
    getUserChats,
    getChatMessages,
    sendMessage,
    uploadFile: [upload.single('file'), uploadFileHandler],
    getChatInfo
}; 