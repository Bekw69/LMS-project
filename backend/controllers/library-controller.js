const Library = require('../models/librarySchema.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/library/';
        // Создаем папку если она не существует
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB максимум
    },
    fileFilter: function (req, file, cb) {
        // Разрешенные типы файлов
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|zip|rar|mp4|avi|mov|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Недопустимый тип файла'));
        }
    }
});

// Загрузка материала в библиотеку
const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не был загружен'
            });
        }

        const { title, description, subject, teacher, school, sclass } = req.body;

        const material = new Library({
            title,
            description,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: path.extname(req.file.originalname).toLowerCase().substr(1),
            fileSize: req.file.size,
            subject,
            teacher,
            school,
            sclass
        });

        await material.save();

        res.status(201).json({
            success: true,
            message: 'Материал успешно загружен',
            data: material
        });
    } catch (error) {
        // Удаляем файл если произошла ошибка
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Ошибка при удалении файла:', err);
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Получение всех материалов
const getMaterials = async (req, res) => {
    try {
        const { teacherId, subjectId, sclassId, fileType } = req.query;
        
        let filter = {};
        if (teacherId) filter.teacher = teacherId;
        if (subjectId) filter.subject = subjectId;
        if (sclassId) filter.sclass = sclassId;
        if (fileType) filter.fileType = fileType;

        const materials = await Library.find(filter)
            .populate('subject', 'subName subCode')
            .populate('sclass', 'sclassName')
            .populate('teacher', 'name')
            .sort({ uploadDate: -1 });

        res.status(200).json({
            success: true,
            data: materials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Скачивание материала
const downloadMaterial = async (req, res) => {
    try {
        const material = await Library.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Материал не найден'
            });
        }

        // Проверяем существование файла
        if (!fs.existsSync(material.filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Файл не найден на сервере'
            });
        }

        // Увеличиваем счетчик скачиваний (если есть такое поле)
        await Library.findByIdAndUpdate(req.params.id, {
            $inc: { downloadCount: 1 }
        });

        // Отправляем файл
        res.download(material.filePath, material.fileName);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Удаление материала
const deleteMaterial = async (req, res) => {
    try {
        const material = await Library.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Материал не найден'
            });
        }

        // Удаляем файл с диска
        if (fs.existsSync(material.filePath)) {
            fs.unlink(material.filePath, (err) => {
                if (err) console.error('Ошибка при удалении файла:', err);
            });
        }

        // Удаляем запись из базы данных
        await Library.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Материал успешно удален'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Обновление информации о материале
const updateMaterial = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        const material = await Library.findByIdAndUpdate(
            req.params.id,
            { title, description },
            { new: true }
        );

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Материал не найден'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Информация о материале обновлена',
            data: material
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Получение материала по ID
const getMaterialById = async (req, res) => {
    try {
        const material = await Library.findById(req.params.id)
            .populate('subject', 'subName subCode')
            .populate('sclass', 'sclassName')
            .populate('teacher', 'name email');

        if (!material) {
            return res.status(404).json({
                success: false,
                message: 'Материал не найден'
            });
        }

        res.status(200).json({
            success: true,
            data: material
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Получение статистики загрузок
const getUploadStats = async (req, res) => {
    try {
        const { teacherId, subjectId, sclassId } = req.query;
        
        let filter = {};
        if (teacherId) filter.teacher = teacherId;
        if (subjectId) filter.subject = subjectId;
        if (sclassId) filter.sclass = sclassId;

        const stats = await Library.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalFiles: { $sum: 1 },
                    totalSize: { $sum: '$fileSize' },
                    totalDownloads: { $sum: '$downloadCount' },
                    fileTypes: { $push: '$fileType' }
                }
            }
        ]);

        const fileTypeStats = await Library.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$fileType',
                    count: { $sum: 1 },
                    size: { $sum: '$fileSize' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                general: stats[0] || {
                    totalFiles: 0,
                    totalSize: 0,
                    totalDownloads: 0
                },
                byFileType: fileTypeStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadMaterial,
    getMaterials,
    downloadMaterial,
    deleteMaterial,
    updateMaterial,
    getMaterialById,
    getUploadStats,
    upload
}; 