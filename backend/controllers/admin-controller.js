const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');
const Notification = require('../models/notificationSchema.js');
const multer = require('multer');
const path = require('path');

// Секретный ключ для регистрации админов (в реальности лучше вынести в .env)
const ADMIN_SECRET_KEY = "SUPER_SECRET_ADMIN_KEY_2024";

// Временные данные для демонстрации (в памяти)
const DEMO_ADMIN = {
    _id: "demo_admin_id_123",
    name: "Главный Администратор",
    email: "admin@school.com",
    schoolName: "Главная Школа", 
    adminLevel: "SuperAdmin",
    isPreinstalled: true,
    role: "Admin"
};

// Генерация JWT токена
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            role: 'Admin',
            email: user.email,
            name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Проверка подключения к MongoDB
const isMongoConnected = () => {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
};

const adminRegister = async (req, res) => {
    try {
        const { name, email, password, schoolName } = req.body;

        // Проверка на существующие email
        const existingAdminByEmail = await Admin.findOne({ email: email });
        if (existingAdminByEmail) {
            return res.status(400).json({ 
                success: false,
                message: 'Email уже используется' 
            });
        }

        // Проверяем, есть ли уже главный админ для этой школы
        const existingSchool = await Admin.findOne({ schoolName: schoolName });
        let adminLevel = 'Admin';
        let createdBy = null;

        if (existingSchool) {
            // Если школа существует, это младший админ
            adminLevel = 'Admin';
            createdBy = existingSchool._id;
        } else {
            // Если школы нет, проверяем есть ли уже SuperAdmin
            const existingSuperAdmin = await Admin.findOne({ adminLevel: 'SuperAdmin' });
            if (!existingSuperAdmin) {
                adminLevel = 'SuperAdmin';
            }
        }

        // Хэшируем пароль перед сохранением
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new Admin({
            name,
            email,
            schoolName,
            password: hashedPassword,
            adminLevel,
            createdBy
        });

        const result = await admin.save();
        
        // Создаем объект для отправки, не включая пароль
        const adminData = result.toObject();
        delete adminData.password;

        // Генерируем JWT токен
        const token = generateToken(result);

        // Создаем уведомление о создании аккаунта
        await Notification.create({
            recipient: result._id,
            recipientModel: 'admin',
            senderModel: 'system',
            type: 'account_created',
            title: 'Добро пожаловать!',
            message: `Ваш аккаунт администратора успешно создан для школы "${schoolName}"`,
            priority: 'medium',
            category: 'system'
        });

        res.status(201).json({
            success: true,
            message: 'Администратор успешно зарегистрирован',
            data: {
                admin: adminData,
                token
            }
        });

    } catch (err) {
        console.error("ADMIN REGISTER ERROR:", err);
        res.status(500).json({ 
            success: false,
            message: "Внутренняя ошибка сервера", 
            error: err.message 
        });
    }
};

// Метод для создания предустановленного админа
const createPreinstalledAdmin = async () => {
    try {
        // Проверяем, есть ли уже предустановленный админ
        const existingPreinstalled = await Admin.findOne({ isPreinstalled: true });
        if (existingPreinstalled) {
            console.log("Предустановленный админ уже существует");
            return;
        }

        // Создаем предустановленного главного админа
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        const preinstalledAdmin = new Admin({
            name: process.env.DEFAULT_ADMIN_NAME || "Главный Администратор",
            email: process.env.DEFAULT_ADMIN_EMAIL || "admin@school.com",
            schoolName: "Главная Школа",
            password: hashedPassword,
            adminLevel: "SuperAdmin",
            isPreinstalled: true
        });

        const savedAdmin = await preinstalledAdmin.save();
        console.log("Создан предустановленный главный админ:");
        console.log(`Email: ${savedAdmin.email}`);
        console.log(`Пароль: ${defaultPassword}`);
        console.log("Уровень: SuperAdmin");

        // Создаем демо-данные
        await createDemoData(savedAdmin._id);

    } catch (err) {
        console.error("Ошибка создания предустановленного админа:", err);
    }
};

// Функция для создания демо-данных
const createDemoData = async (adminId) => {
    try {
        console.log("Создание демо-данных...");
        
        // Создаем демо-класс
        const demoClass = new Sclass({
            sclassName: "10А",
            school: adminId
        });
        await demoClass.save();

        // Создаем демо-предмет
        const demoSubject = new Subject({
            subName: "Математика",
            subCode: "MATH10",
            sessions: 5,
            sclassName: demoClass._id,
            school: adminId
        });
        await demoSubject.save();

        console.log("Демо-данные созданы успешно!");

    } catch (err) {
        console.error("Ошибка создания демо-данных:", err);
    }
};

const adminLogIn = async (req, res) => {
    // --- НАЧАЛО БЛОКА ОТЛАДКИ ---
    console.log("\n\n--- [НОВАЯ ПОПЫТКА ВХОДА] ---");
    console.log("Время:", new Date().toLocaleTimeString());
    console.log("[1. ПОЛУЧЕННЫЕ ДАННЫЕ]:", req.body);
    // --- КОНЕЦ БЛОКА ОТЛАДКИ ---

    if (req.body.email && req.body.password) {
        try {
            const admin = await Admin.findOne({ email: req.body.email });

            if (!admin) {
                // --- НАЧАЛО БЛОКА ОТЛАДКИ ---
                console.log("[2. РЕЗУЛЬТАТ ПОИСКА]: Администратор с таким email НЕ НАЙДЕН в базе данных.");
                console.log("--- [КОНЕЦ ПОПЫТКИ] ---\n");
                // --- КОНЕЦ БЛОКА ОТЛАДКИ ---
                return res.status(404).json({
                    success: false,
                    message: "Пользователь не найден"
                });
            }

            // --- НАЧАЛО БЛОКА ОТЛАДКИ ---
            console.log("[2. РЕЗУЛЬТАТ ПОИСКА]: Администратор найден. ID:", admin._id);
            console.log("[3. ПРОВЕРКА ПАРОЛЯ]: Сравниваем введенный пароль с хэшем в базе...");
            // --- КОНЕЦ БЛОКА ОТЛАДКИ ---

            const validated = await bcrypt.compare(req.body.password, admin.password);

            if (validated) {
                // --- НАЧАЛО БЛОКА ОТЛАДКИ ---
                console.log("[4. РЕЗУЛЬТАТ ПРОВЕРКИ]: ПАРОЛИ СОВПАЛИ! Успешный вход.");
                console.log("--- [КОНЕЦ ПОПЫТКИ] ---\n");
                // --- КОНЕЦ БЛОКА ОТЛАДКИ ---

                const adminData = admin.toObject();
                delete adminData.password;

                const token = generateToken(admin);

                res.status(200).json({
                    success: true,
                    message: 'Успешный вход в систему',
                    data: {
                        admin: adminData,
                        token
                    }
                });
            } else {
                // --- НАЧАЛО БЛОКА ОТЛАДКИ ---
                console.log("[4. РЕЗУЛЬТАТ ПРОВЕРКИ]: ПАРОЛИ НЕ СОВПАЛИ! Отказ в доступе.");
                console.log("--- [КОНЕЦ ПОПЫТКИ] ---\n");
                // --- КОНЕЦ БЛОКА ОТЛАДКИ ---

                res.status(401).json({
                    success: false,
                    message: "Неверный пароль"
                });
            }
        } catch (err) {
            console.error("ADMIN LOGIN ERROR:", err);
            res.status(500).json({
                success: false,
                message: "Внутренняя ошибка сервера",
                error: err.message
            });
        }
    } else {
        // --- НАЧАЛО БЛОКА ОТЛАДКИ ---
        console.log("[ОШИБКА ЗАПРОСА]: Email или пароль не были переданы в запросе.");
        console.log("--- [КОНЕЦ ПОПЫТКИ] ---\n");
        // --- КОНЕЦ БЛОКА ОТЛАДКИ ---

        res.status(400).json({
            success: false,
            message: "Email и пароль обязательны"
        });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id)
            .select("-password")
            .populate('createdBy', 'name email');
        
        if (admin) {
            res.status(200).json({
                success: true,
                data: admin
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: "Администратор не найден" 
            });
        }
    } catch (err) {
        console.error("GET ADMIN DETAIL ERROR:", err);
        res.status(500).json({ 
            success: false,
            message: "Внутренняя ошибка сервера", 
            error: err.message 
        });
    }
};

// Удаление админа с каскадным удалением
const deleteAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;
        
        // Проверяем, что админ существует
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                message: "Администратор не найден" 
            });
        }

        // Проверяем, что это не предустановленный SuperAdmin
        if (admin.isPreinstalled && admin.adminLevel === 'SuperAdmin') {
            return res.status(403).json({ 
                success: false,
                message: "Нельзя удалить предустановленного главного администратора" 
            });
        }

        // Каскадное удаление связанных данных
        await Promise.all([
            Student.deleteMany({ school: adminId }),
            Teacher.deleteMany({ school: adminId }),
            Sclass.deleteMany({ school: adminId }),
            Subject.deleteMany({ school: adminId }),
            Notice.deleteMany({ school: adminId }),
            Complain.deleteMany({ school: adminId }),
            Notification.deleteMany({ recipient: adminId })
        ]);

        // Удаляем самого админа
        await Admin.findByIdAndDelete(adminId);

        res.status(200).json({ 
            success: true,
            message: "Администратор и все связанные данные успешно удалены" 
        });

    } catch (err) {
        console.error("DELETE ADMIN ERROR:", err);
        res.status(500).json({ 
            success: false,
            message: "Внутренняя ошибка сервера", 
            error: err.message 
        });
    }
};

// Обновление админа
const updateAdmin = async (req, res) => {
    try {
        const { name, email, schoolName } = req.body;
        const updateData = { 
            name, 
            email, 
            schoolName,
            updatedAt: new Date()
        };

        const result = await Admin.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).select("-password");

        if (result) {
            res.status(200).json({
                success: true,
                message: 'Администратор успешно обновлен',
                data: result
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: "Администратор не найден" 
            });
        }
    } catch (err) {
        console.error("UPDATE ADMIN ERROR:", err);
        
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: "Email уже используется" 
            });
        }

        res.status(500).json({ 
            success: false,
            message: "Внутренняя ошибка сервера", 
            error: err.message 
        });
    }
};

// Обновление профиля админа с поддержкой аватарки
const updateAdminProfile = async (req, res) => {
    try {
        const { name, email, schoolName, password, phone, position, bio, avatar } = req.body;
        const adminId = req.params.id;

        // Проверяем существование админа
        const existingAdmin = await Admin.findById(adminId);
        if (!existingAdmin) {
            return res.status(404).json({ 
                success: false,
                message: "Администратор не найден" 
            });
        }

        // Подготавливаем данные для обновления
        const updateData = {
            name: name || existingAdmin.name,
            email: email || existingAdmin.email,
            schoolName: schoolName || existingAdmin.schoolName,
            phone: phone || existingAdmin.phone,
            position: position || existingAdmin.position,
            bio: bio || existingAdmin.bio,
            updatedAt: new Date()
        };

        // Если передан новый пароль, хэшируем его
        if (password && password.trim() !== '') {
            if (password.length < 6) {
                return res.status(400).json({ 
                    success: false,
                    message: "Пароль должен содержать минимум 6 символов" 
                });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Если передан аватар (base64), сохраняем его
        if (avatar) {
            updateData.avatar = avatar;
        }

        // Обновляем админа
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId, 
            updateData, 
            { new: true, runValidators: true }
        ).select("-password");

        if (updatedAdmin) {
            res.status(200).json({
                success: true,
                message: "Профиль успешно обновлен",
                data: updatedAdmin
            });
        } else {
            res.status(404).json({ 
                success: false,
                message: "Не удалось обновить профиль" 
            });
        }

    } catch (err) {
        console.error("UPDATE ADMIN PROFILE ERROR:", err);
        
        // Обработка ошибок валидации
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ 
                success: false,
                message: "Ошибка валидации", 
                errors 
            });
        }

        // Обработка ошибки дублирования email
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: "Email уже используется" 
            });
        }

        res.status(500).json({ 
            success: false,
            message: "Внутренняя ошибка сервера", 
            error: err.message 
        });
    }
};

// Получение статистики для dashboard
const getDashboardStats = async (req, res) => {
    try {
        const adminId = req.user.id;

        const [
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects,
            totalNotices,
            totalComplaints,
            recentStudents,
            recentTeachers
        ] = await Promise.all([
            Student.countDocuments({ school: adminId }),
            Teacher.countDocuments({ school: adminId }),
            Sclass.countDocuments({ school: adminId }),
            Subject.countDocuments({ school: adminId }),
            Notice.countDocuments({ school: adminId }),
            Complain.countDocuments({ school: adminId }),
            Student.find({ school: adminId }).sort({ createdAt: -1 }).limit(5).select('name rollNum sclassName'),
            Teacher.find({ school: adminId }).sort({ createdAt: -1 }).limit(5).select('name email teachSubject')
        ]);

        // Статистика по месяцам
        const monthlyStats = await Student.aggregate([
            { $match: { school: adminId } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalStudents,
                    totalTeachers,
                    totalClasses,
                    totalSubjects,
                    totalNotices,
                    totalComplaints
                },
                recent: {
                    students: recentStudents,
                    teachers: recentTeachers
                },
                monthlyRegistrations: monthlyStats
            }
        });

    } catch (err) {
        console.error("GET DASHBOARD STATS ERROR:", err);
        res.status(500).json({ 
            success: false,
            message: "Ошибка получения статистики", 
            error: err.message 
        });
    }
};

// Смена пароля
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.user.id;

        // Проверяем текущий пароль
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                message: "Администратор не найден" 
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                success: false,
                message: "Неверный текущий пароль" 
            });
        }

        // Валидация нового пароля
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: "Новый пароль должен содержать минимум 6 символов" 
            });
        }

        // Хэшируем новый пароль
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Обновляем пароль
        await Admin.findByIdAndUpdate(adminId, { 
            password: hashedNewPassword,
            updatedAt: new Date()
        });

        res.json({
            success: true,
            message: "Пароль успешно изменен"
        });

    } catch (err) {
        console.error("CHANGE PASSWORD ERROR:", err);
        res.status(500).json({ 
            success: false,
            message: "Ошибка смены пароля", 
            error: err.message 
        });
    }
};

module.exports = { 
    adminRegister, 
    adminLogIn, 
    getAdminDetail, 
    createPreinstalledAdmin,
    deleteAdmin,
    updateAdmin,
    updateAdminProfile,
    getDashboardStats,
    changePassword
};
