const router = require('express').Router();

// Импорт middleware
const { authenticateToken, adminOnly, adminAndTeacher } = require('../middleware/auth');
const { authLimiter, createAccountLimiter } = require('../middleware/security');
const { 
    validateAdminRegistration, 
    validateLogin,
    validateStudentCreation,
    validateTeacherCreation,
    validateClassCreation,
    validateSubjectCreation,
    validateNoticeCreation,
    validateComplainCreation
} = require('../middleware/validation');

// Импорт контроллеров
const { 
    adminRegister, 
    adminLogIn, 
    getAdminDetail,
    deleteAdmin,
    updateAdmin,
    updateAdminProfile,
    getDashboardStats,
    changePassword
} = require('../controllers/admin-controller.js');

const { 
    studentRegister, 
    studentLogIn, 
    getStudents, 
    getStudentDetail, 
    deleteStudents, 
    deleteStudent, 
    updateStudent, 
    studentAttendance, 
    deleteStudentsByClass, 
    updateExamResult, 
    clearAllStudentsAttendanceBySubject, 
    clearAllStudentsAttendance, 
    removeStudentAttendanceBySubject, 
    removeStudentAttendance 
} = require('../controllers/student_controller.js');

const { 
    teacherRegister, 
    teacherLogIn, 
    getTeachers, 
    getTeacherDetail, 
    deleteTeachers, 
    deleteTeachersByClass, 
    deleteTeacher, 
    updateTeacherSubject, 
    teacherAttendance 
} = require('../controllers/teacher-controller.js');

const { 
    noticeCreate, 
    noticeList, 
    deleteNotices, 
    deleteNotice, 
    updateNotice 
} = require('../controllers/notice-controller.js');

const { 
    complainCreate, 
    complainList, 
    deleteComplaints, 
    deleteComplain 
} = require('../controllers/complain-controller.js');

const { 
    sclassCreate, 
    sclassList, 
    deleteSclass, 
    deleteSclasses, 
    getSclassDetail, 
    getSclassStudents 
} = require('../controllers/class-controller.js');

const { 
    subjectCreate, 
    classSubjects, 
    deleteSubjectsByClass, 
    getSubjectDetail, 
    deleteSubject, 
    freeSubjectList, 
    allSubjects, 
    deleteSubjects 
} = require('../controllers/subject-controller.js');

// Импорт новых контроллеров
const teacherRequestRoutes = require('./teacherRequestRoutes');
const notificationRoutes = require('./notificationRoutes');

// ===== ADMIN ROUTES =====
router.post('/AdminReg', createAccountLimiter, validateAdminRegistration, adminRegister);
router.post('/AdminLogin', authLimiter, validateLogin, adminLogIn);

router.get('/Admin/:id', authenticateToken, adminOnly, getAdminDetail);
router.delete('/Admin/:id', authenticateToken, adminOnly, deleteAdmin);
router.put('/Admin/:id', authenticateToken, adminOnly, updateAdmin);
router.put('/AdminProfile/:id', authenticateToken, adminOnly, updateAdminProfile);
router.post('/AdminChangePassword', authenticateToken, adminOnly, changePassword);
router.get('/AdminDashboard', authenticateToken, adminOnly, getDashboardStats);

// ===== STUDENT ROUTES =====
router.post('/StudentReg', authenticateToken, adminOnly, validateStudentCreation, studentRegister);
router.post('/StudentLogin', authLimiter, validateLogin, studentLogIn);

router.get('/Students/:id', authenticateToken, adminOnly, getStudents);
router.get('/Student/:id', authenticateToken, getStudentDetail);
router.delete('/Students/:id', authenticateToken, adminOnly, deleteStudents);
router.delete('/StudentsClass/:id', authenticateToken, adminOnly, deleteStudentsByClass);
router.delete('/Student/:id', authenticateToken, adminOnly, deleteStudent);
router.put('/Student/:id', authenticateToken, adminOnly, updateStudent);

router.put('/UpdateExamResult/:id', authenticateToken, adminAndTeacher, updateExamResult);

router.put('/StudentAttendance/:id', authenticateToken, adminAndTeacher, studentAttendance);

router.put('/RemoveAllStudentsSubAtten/:id', authenticateToken, adminOnly, clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', authenticateToken, adminOnly, clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', authenticateToken, adminOnly, removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', authenticateToken, adminOnly, removeStudentAttendance);

// ===== TEACHER ROUTES =====
router.post('/TeacherReg', authenticateToken, adminOnly, validateTeacherCreation, teacherRegister);
router.post('/TeacherLogin', authLimiter, validateLogin, teacherLogIn);

router.get('/Teachers/:id', authenticateToken, adminOnly, getTeachers);
router.get('/Teacher/:id', authenticateToken, getTeacherDetail);
router.delete('/Teachers/:id', authenticateToken, adminOnly, deleteTeachers);
router.delete('/TeachersClass/:id', authenticateToken, adminOnly, deleteTeachersByClass);
router.delete('/Teacher/:id', authenticateToken, adminOnly, deleteTeacher);

router.put('/TeacherSubject', authenticateToken, adminOnly, updateTeacherSubject);

router.post('/TeacherAttendance/:id', authenticateToken, adminAndTeacher, teacherAttendance);

// ===== NOTICE ROUTES =====
router.post('/NoticeCreate', authenticateToken, adminOnly, validateNoticeCreation, noticeCreate);
router.get('/NoticeList/:id', authenticateToken, noticeList);
router.delete('/Notices/:id', authenticateToken, adminOnly, deleteNotices);
router.delete('/Notice/:id', authenticateToken, adminOnly, deleteNotice);
router.put('/Notice/:id', authenticateToken, adminOnly, updateNotice);

// ===== COMPLAINT ROUTES =====
router.post('/ComplainCreate', authenticateToken, validateComplainCreation, complainCreate);
router.get('/ComplainList/:id', authenticateToken, complainList);
router.delete('/Complains/:id', authenticateToken, adminOnly, deleteComplaints);
router.delete('/Complain/:id', authenticateToken, adminOnly, deleteComplain);

// ===== CLASS ROUTES =====
router.post('/SclassCreate', authenticateToken, adminOnly, validateClassCreation, sclassCreate);
router.get('/SclassList/:id', authenticateToken, sclassList);
router.get('/Sclass/:id', authenticateToken, getSclassDetail);
router.get('/Sclass/Students/:id', authenticateToken, getSclassStudents);
router.delete('/Sclasses/:id', authenticateToken, adminOnly, deleteSclasses);
router.delete('/Sclass/:id', authenticateToken, adminOnly, deleteSclass);

// ===== SUBJECT ROUTES =====
router.post('/SubjectCreate', authenticateToken, adminOnly, validateSubjectCreation, subjectCreate);
router.get('/AllSubjects/:id', authenticateToken, allSubjects);
router.get('/ClassSubjects/:id', authenticateToken, classSubjects);
router.get('/FreeSubjectList/:id', authenticateToken, adminOnly, freeSubjectList);
router.get('/Subject/:id', authenticateToken, getSubjectDetail);
router.delete('/Subject/:id', authenticateToken, adminOnly, deleteSubject);
router.delete('/Subjects/:id', authenticateToken, adminOnly, deleteSubjects);
router.delete('/SubjectsClass/:id', authenticateToken, adminOnly, deleteSubjectsByClass);

// ===== NEW FEATURE ROUTES =====
// Teacher Requests
router.use('/teacher-requests', teacherRequestRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

// ===== UTILITY ROUTES =====
// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date(),
        version: '2.0.0'
    });
});

// API Info
router.get('/api-info', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'School Management System API',
            version: '2.0.0',
            description: 'Enhanced MERN Stack School Management System',
            features: [
                'User Authentication with JWT',
                'Role-based Access Control',
                'Teacher Request System',
                'Real-time Notifications',
                'Advanced Security',
                'Rate Limiting',
                'Input Validation',
                'Comprehensive Logging'
            ],
            endpoints: {
                admin: '/Admin*',
                student: '/Student*',
                teacher: '/Teacher*',
                notices: '/Notice*',
                complaints: '/Complain*',
                classes: '/Sclass*',
                subjects: '/Subject*',
                teacherRequests: '/teacher-requests/*',
                notifications: '/notifications/*'
            }
        }
    });
});

module.exports = router;