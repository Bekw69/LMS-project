const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const Admin = require('./models/adminSchema');
const Sclass = require('./models/sclassSchema');
const Subject = require('./models/subjectSchema');
const Teacher = require('./models/teacherSchema');
const Student = require('./models/studentSchema');
const Grade = require('./models/gradeSchema');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const MONGO_CONNECTION_STRING = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/school";
        console.log("Подключение к MongoDB:", MONGO_CONNECTION_STRING);
        
        await mongoose.connect(MONGO_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log('MongoDB подключен');
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error.message);
        console.log('\n❌ Не удалось подключиться к MongoDB.');
        console.log('Убедитесь, что:');
        console.log('1. MongoDB запущен локально, ИЛИ');
        console.log('2. Установлена переменная окружения MONGO_URI с подключением к MongoDB Atlas');
        process.exit(1);
    }
};

// Hash password function
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Seed data
const seedData = async () => {
    try {
        // Clear existing data
        console.log('Очистка существующих данных...');
        await Admin.deleteMany({});
        await Sclass.deleteMany({});
        await Subject.deleteMany({});
        await Teacher.deleteMany({});
        await Student.deleteMany({});
        await Grade.deleteMany({});

        // 1. Create SuperAdmin
        console.log('Создание SuperAdmin...');
        const superAdmin = new Admin({
            name: 'Главный Администратор',
            email: 'superadmin@university.kz',
            password: await hashPassword('superadmin123'),
            role: 'Admin',
            adminLevel: 'SuperAdmin',
            schoolName: 'Казахский Национальный Университет',
            isPreinstalled: true,
            phone: '+7 (727) 377-33-33',
            position: 'Главный администратор системы',
            bio: 'Главный администратор университетской системы управления'
        });
        await superAdmin.save();

        // 2. Create regular admins
        console.log('Создание обычных администраторов...');
        const admin1 = new Admin({
            name: 'Айгуль Нурланова',
            email: 'aigul.admin@university.kz',
            password: await hashPassword('admin123'),
            role: 'Admin',
            adminLevel: 'Admin',
            schoolName: 'Казахский Национальный Университет',
            createdBy: superAdmin._id,
            phone: '+7 (727) 377-33-34',
            position: 'Администратор факультета',
            bio: 'Администратор факультета информационных технологий'
        });
        await admin1.save();

        const admin2 = new Admin({
            name: 'Ерлан Касымов',
            email: 'erlan.admin@university.kz',
            password: await hashPassword('admin123'),
            role: 'Admin',
            adminLevel: 'Admin',
            schoolName: 'Казахский Национальный Университет',
            createdBy: superAdmin._id,
            phone: '+7 (727) 377-33-35',
            position: 'Администратор деканата',
            bio: 'Администратор деканата экономического факультета'
        });
        await admin2.save();

        // 3. Create classes (groups)
        console.log('Создание групп...');
        const classes = [
            { sclassName: 'ИТ-21-1', school: superAdmin._id },
            { sclassName: 'ИТ-21-2', school: superAdmin._id },
            { sclassName: 'ЭК-21-1', school: superAdmin._id },
            { sclassName: 'ЭК-21-2', school: superAdmin._id },
            { sclassName: 'ФИЛ-21-1', school: superAdmin._id }
        ];

        const createdClasses = await Sclass.insertMany(classes);
        console.log(`Создано ${createdClasses.length} групп`);

        // 4. Create subjects
        console.log('Создание предметов...');
        const subjects = [
            // IT subjects
            { subName: 'Программирование на Java', subCode: 'CS101', sessions: '60', sclassName: createdClasses[0]._id, school: superAdmin._id },
            { subName: 'Базы данных', subCode: 'CS102', sessions: '45', sclassName: createdClasses[0]._id, school: superAdmin._id },
            { subName: 'Веб-разработка', subCode: 'CS103', sessions: '50', sclassName: createdClasses[0]._id, school: superAdmin._id },
            { subName: 'Алгоритмы и структуры данных', subCode: 'CS104', sessions: '55', sclassName: createdClasses[0]._id, school: superAdmin._id },
            
            { subName: 'Python программирование', subCode: 'CS201', sessions: '60', sclassName: createdClasses[1]._id, school: superAdmin._id },
            { subName: 'Машинное обучение', subCode: 'CS202', sessions: '45', sclassName: createdClasses[1]._id, school: superAdmin._id },
            { subName: 'Кибербезопасность', subCode: 'CS203', sessions: '40', sclassName: createdClasses[1]._id, school: superAdmin._id },
            
            // Economics subjects
            { subName: 'Микроэкономика', subCode: 'EC101', sessions: '45', sclassName: createdClasses[2]._id, school: superAdmin._id },
            { subName: 'Макроэкономика', subCode: 'EC102', sessions: '45', sclassName: createdClasses[2]._id, school: superAdmin._id },
            { subName: 'Финансы и кредит', subCode: 'EC103', sessions: '40', sclassName: createdClasses[2]._id, school: superAdmin._id },
            
            { subName: 'Международная экономика', subCode: 'EC201', sessions: '40', sclassName: createdClasses[3]._id, school: superAdmin._id },
            { subName: 'Эконометрика', subCode: 'EC202', sessions: '35', sclassName: createdClasses[3]._id, school: superAdmin._id },
            
            // Philology subjects
            { subName: 'Современная казахская литература', subCode: 'KL101', sessions: '40', sclassName: createdClasses[4]._id, school: superAdmin._id },
            { subName: 'Лингвистика', subCode: 'KL102', sessions: '35', sclassName: createdClasses[4]._id, school: superAdmin._id },
            { subName: 'Сравнительное литературоведение', subCode: 'KL103', sessions: '30', sclassName: createdClasses[4]._id, school: superAdmin._id }
        ];

        const createdSubjects = await Subject.insertMany(subjects);
        console.log(`Создано ${createdSubjects.length} предметов`);

        // 5. Create teachers
        console.log('Создание преподавателей...');
        const teachers = [
            {
                name: 'Асылбек Турганбаев',
                email: 'asylbek.teacher@university.kz',
                password: await hashPassword('teacher123'),
                role: 'Teacher',
                school: superAdmin._id,
                teachSubject: createdSubjects[0]._id, // Java
                teachSclass: createdClasses[0]._id,
                phone: '+7 (727) 377-44-01',
                position: 'Старший преподаватель',
                bio: 'Специалист по объектно-ориентированному программированию'
            },
            {
                name: 'Гульнара Сейтказиева',
                email: 'gulnara.teacher@university.kz',
                password: await hashPassword('teacher123'),
                role: 'Teacher',
                school: superAdmin._id,
                teachSubject: createdSubjects[1]._id, // Базы данных
                teachSclass: createdClasses[0]._id,
                phone: '+7 (727) 377-44-02',
                position: 'Доцент',
                bio: 'Эксперт по системам управления базами данных'
            },
            {
                name: 'Данияр Абдуллаев',
                email: 'daniyar.teacher@university.kz',
                password: await hashPassword('teacher123'),
                role: 'Teacher',
                school: superAdmin._id,
                teachSubject: createdSubjects[4]._id, // Python
                teachSclass: createdClasses[1]._id,
                phone: '+7 (727) 377-44-03',
                position: 'Преподаватель',
                bio: 'Специалист по Python и машинному обучению'
            },
            {
                name: 'Алия Жумабекова',
                email: 'aliya.teacher@university.kz',
                password: await hashPassword('teacher123'),
                role: 'Teacher',
                school: superAdmin._id,
                teachSubject: createdSubjects[7]._id, // Микроэкономика
                teachSclass: createdClasses[2]._id,
                phone: '+7 (727) 377-44-04',
                position: 'Доцент',
                bio: 'Кандидат экономических наук, специалист по микроэкономике'
            },
            {
                name: 'Нурлан Оспанов',
                email: 'nurlan.teacher@university.kz',
                password: await hashPassword('teacher123'),
                role: 'Teacher',
                school: superAdmin._id,
                teachSubject: createdSubjects[12]._id, // Казахская литература
                teachSclass: createdClasses[4]._id,
                phone: '+7 (727) 377-44-05',
                position: 'Профессор',
                bio: 'Доктор филологических наук, исследователь казахской литературы'
            }
        ];

        const createdTeachers = await Teacher.insertMany(teachers);
        console.log(`Создано ${createdTeachers.length} преподавателей`);

        // Update subjects with teachers
        await Subject.findByIdAndUpdate(createdSubjects[0]._id, { teacher: createdTeachers[0]._id });
        await Subject.findByIdAndUpdate(createdSubjects[1]._id, { teacher: createdTeachers[1]._id });
        await Subject.findByIdAndUpdate(createdSubjects[4]._id, { teacher: createdTeachers[2]._id });
        await Subject.findByIdAndUpdate(createdSubjects[7]._id, { teacher: createdTeachers[3]._id });
        await Subject.findByIdAndUpdate(createdSubjects[12]._id, { teacher: createdTeachers[4]._id });

        // 6. Create students
        console.log('Создание студентов...');
        const students = [
            // IT-21-1 students
            {
                name: 'Айдар Қасымов',
                rollNum: 'IT211001',
                password: await hashPassword('student123'),
                sclassName: createdClasses[0]._id,
                school: superAdmin._id,
                role: 'Student',
                email: 'aidar.student@university.kz',
                phone: '+7 (777) 123-45-01'
            },
            {
                name: 'Амина Нурланова',
                rollNum: 'IT211002',
                password: await hashPassword('student123'),
                sclassName: createdClasses[0]._id,
                school: superAdmin._id,
                role: 'Student',
                email: 'amina.student@university.kz',
                phone: '+7 (777) 123-45-02'
            },
            {
                name: 'Ерлан Сейтов',
                rollNum: 'IT211003',
                password: await hashPassword('student123'),
                sclassName: createdClasses[0]._id,
                school: superAdmin._id,
                role: 'Student',
                email: 'erlan.student@university.kz',
                phone: '+7 (777) 123-45-03'
            },
            // IT-21-2 students
            {
                name: 'Жанар Абдуллаева',
                rollNum: 'IT212001',
                password: await hashPassword('student123'),
                sclassName: createdClasses[1]._id,
                school: superAdmin._id,
                role: 'Student',
                email: 'zhanar.student@university.kz',
                phone: '+7 (777) 123-45-04'
            },
            {
                name: 'Мурат Токтаров',
                rollNum: 'IT212002',
                password: await hashPassword('student123'),
                sclassName: createdClasses[1]._id,
                school: superAdmin._id,
                role: 'Student',
                email: 'murat.student@university.kz',
                phone: '+7 (777) 123-45-05'
            },
            // Economics students
            {
                name: 'Сауле Жумагулова',
                rollNum: 'EC211001',
                password: await hashPassword('student123'),
                sclassName: createdClasses[2]._id,
                school: superAdmin._id,
                role: 'Student',
                email: 'saule.student@university.kz',
                phone: '+7 (777) 123-45-06'
            },
            {
                name: 'Темирлан Бекназаров',
                rollNum: 'EC211002',
                password: await hashPassword('student123'),
                sclassName: createdClasses[2]._id,
                school: superAdmin._id,
                role: 'Student',
                email: 'temirlan.student@university.kz',
                phone: '+7 (777) 123-45-07'
            },
            // Philology students
            {
                name: 'Алтынай Мусаева',
                rollNum: 'KL211001',
                password: await hashPassword('student123'),
                sclassName: createdClasses[4]._id,
                school: superAdmin._id,
                role: 'Student',
                email: 'altynai.student@university.kz',
                phone: '+7 (777) 123-45-08'
            }
        ];

        const createdStudents = await Student.insertMany(students);
        console.log(`Создано ${createdStudents.length} студентов`);

        // 7. Create sample grades
        console.log('Создание примерных оценок...');
        const grades = [
            // Java grades for IT-21-1 students
            {
                student: createdStudents[0]._id,
                subject: createdSubjects[0]._id,
                class: createdClasses[0]._id,
                teacher: createdTeachers[0]._id,
                school: superAdmin._id,
                gradeValue: 5,
                gradeType: 'exam',
                assignmentTitle: 'Итоговый экзамен по Java',
                gradedDate: new Date('2024-01-15')
            },
            {
                student: createdStudents[0]._id,
                subject: createdSubjects[0]._id,
                class: createdClasses[0]._id,
                teacher: createdTeachers[0]._id,
                school: superAdmin._id,
                gradeValue: 4,
                gradeType: 'homework',
                assignmentTitle: 'Домашнее задание: ООП принципы',
                gradedDate: new Date('2024-01-10')
            },
            {
                student: createdStudents[1]._id,
                subject: createdSubjects[0]._id,
                class: createdClasses[0]._id,
                teacher: createdTeachers[0]._id,
                school: superAdmin._id,
                gradeValue: 4,
                gradeType: 'exam',
                assignmentTitle: 'Итоговый экзамен по Java',
                gradedDate: new Date('2024-01-15')
            },
            // Database grades
            {
                student: createdStudents[0]._id,
                subject: createdSubjects[1]._id,
                class: createdClasses[0]._id,
                teacher: createdTeachers[1]._id,
                school: superAdmin._id,
                gradeValue: 5,
                gradeType: 'project',
                assignmentTitle: 'Проект: Система управления библиотекой',
                gradedDate: new Date('2024-01-20')
            },
            // Economics grades
            {
                student: createdStudents[5]._id,
                subject: createdSubjects[7]._id,
                class: createdClasses[2]._id,
                teacher: createdTeachers[3]._id,
                school: superAdmin._id,
                gradeValue: 4,
                gradeType: 'test',
                assignmentTitle: 'Контрольная работа: Спрос и предложение',
                gradedDate: new Date('2024-01-12')
            }
        ];

        await Grade.insertMany(grades);
        console.log(`Создано ${grades.length} оценок`);

        console.log('\n=== ДАННЫЕ ДЛЯ ВХОДА ===');
        console.log('\nСуперАдминистратор:');
        console.log('Email: superadmin@university.kz');
        console.log('Пароль: superadmin123');
        
        console.log('\nОбычные администраторы:');
        console.log('Email: aigul.admin@university.kz | Пароль: admin123');
        console.log('Email: erlan.admin@university.kz | Пароль: admin123');
        
        console.log('\nПреподаватели:');
        console.log('Email: asylbek.teacher@university.kz | Пароль: teacher123 (Java)');
        console.log('Email: gulnara.teacher@university.kz | Пароль: teacher123 (БД)');
        console.log('Email: daniyar.teacher@university.kz | Пароль: teacher123 (Python)');
        console.log('Email: aliya.teacher@university.kz | Пароль: teacher123 (Экономика)');
        console.log('Email: nurlan.teacher@university.kz | Пароль: teacher123 (Литература)');
        
        console.log('\nСтуденты:');
        console.log('Email: aidar.student@university.kz | Пароль: student123 (ИТ-21-1)');
        console.log('Email: amina.student@university.kz | Пароль: student123 (ИТ-21-1)');
        console.log('Email: zhanar.student@university.kz | Пароль: student123 (ИТ-21-2)');
        console.log('Email: saule.student@university.kz | Пароль: student123 (ЭК-21-1)');
        console.log('Email: altynai.student@university.kz | Пароль: student123 (ФИЛ-21-1)');

        console.log('\n✅ Тестовые данные успешно созданы!');
        
    } catch (error) {
        console.error('Ошибка при создании тестовых данных:', error);
    }
};

// Run the seed
const runSeed = async () => {
    await connectDB();
    await seedData();
    await mongoose.connection.close();
    console.log('Подключение к базе данных закрыто');
    process.exit(0);
};

runSeed(); 