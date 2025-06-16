const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/assignment-controller');

// Маршруты для заданий
router.post('/create', createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);
router.post('/:id/duplicate', duplicateAssignment);
router.get('/:id/submissions', getAssignmentSubmissions);
router.post('/grade', gradeAssignment);

// Новые маршруты для отправки заданий
router.post('/send', sendAssignmentToStudents);
router.get('/students/:sclassId', getStudentsForAssignment);
router.get('/notifications/:studentId', getStudentAssignmentNotifications);
router.put('/notifications/:notificationId/read', markNotificationAsRead);

module.exports = router; 