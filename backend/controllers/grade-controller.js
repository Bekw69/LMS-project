const Grade = require('../models/gradeSchema');
const Student = require('../models/studentSchema');
const Teacher = require('../models/teacherSchema');
const Subject = require('../models/subjectSchema');
const Sclass = require('../models/sclassSchema');

/**
 * CREATE grade
 * POST /grade
 */
exports.createGrade = async (req, res) => {
    try {
        const grade = new Grade(req.body);
        const saved = await grade.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('CREATE GRADE ERROR:', err);
        res.status(500).json({ message: 'Ошибка создания оценки', error: err.message });
    }
};

/**
 * UPDATE grade
 * PUT /grade/:id
 */
exports.updateGrade = async (req, res) => {
    try {
        const updated = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Оценка не найдена' });
        res.json(updated);
    } catch (err) {
        console.error('UPDATE GRADE ERROR:', err);
        res.status(500).json({ message: 'Ошибка обновления оценки', error: err.message });
    }
};

/**
 * DELETE grade
 * DELETE /grade/:id
 */
exports.deleteGrade = async (req, res) => {
    try {
        const deleted = await Grade.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Оценка не найдена' });
        res.json({ message: 'Оценка удалена', grade: deleted });
    } catch (err) {
        console.error('DELETE GRADE ERROR:', err);
        res.status(500).json({ message: 'Ошибка удаления оценки', error: err.message });
    }
};

/**
 * GET grades list
 * GET /grades?studentId=&classId=&subjectId=&teacherId=&quarter=&year=
 */
exports.getGrades = async (req, res) => {
    try {
        const { studentId, classId, subjectId, teacherId, quarter, year, status } = req.query;
        const filter = {};
        if (studentId) filter.student = studentId;
        if (classId) filter.class = classId;
        if (subjectId) filter.subject = subjectId;
        if (teacherId) filter.teacher = teacherId;
        if (quarter) filter.quarter = parseInt(quarter);
        if (year) filter.academicYear = year;
        if (status) filter.status = status;
        const grades = await Grade.find(filter)
            .populate('student', 'name rollNum')
            .populate('teacher', 'name')
            .populate('subject', 'subName')
            .populate('class', 'sclassName');
        res.json(grades);
    } catch (err) {
        console.error('GET GRADES ERROR:', err);
        res.status(500).json({ message: 'Ошибка получения оценок', error: err.message });
    }
};

/**
 * GET analytics (student average, class average)
 * GET /grades/analytics?type=studentAverage&studentId=...&subjectId=...&quarter=...&year=...
 */
exports.getAnalytics = async (req, res) => {
    try {
        const { type } = req.query;
        if (type === 'studentAverage') {
            const { studentId, subjectId, quarter, year } = req.query;
            const average = await Grade.getStudentAverage(studentId, subjectId, parseInt(quarter), year);
            return res.json({ average });
        }
        if (type === 'classAverage') {
            const { classId, subjectId, quarter, year } = req.query;
            const average = await Grade.getClassAverage(classId, subjectId, parseInt(quarter), year);
            return res.json({ average });
        }
        return res.status(400).json({ message: 'Неверный тип аналитики' });
    } catch (err) {
        console.error('GET ANALYTICS ERROR:', err);
        res.status(500).json({ message: 'Ошибка получения аналитики', error: err.message });
    }
}; 