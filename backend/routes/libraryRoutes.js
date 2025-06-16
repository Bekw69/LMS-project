const express = require('express');
const router = express.Router();

const {
    uploadMaterial,
    getMaterials,
    downloadMaterial,
    deleteMaterial,
    updateMaterial,
    getMaterialById,
    getUploadStats,
    upload
} = require('../controllers/library-controller');

// Маршруты для библиотеки
router.post('/upload', upload.single('file'), uploadMaterial);
router.get('/', getMaterials);
router.get('/stats', getUploadStats);
router.get('/:id', getMaterialById);
router.get('/:id/download', downloadMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router; 