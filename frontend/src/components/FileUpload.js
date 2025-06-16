import React, { useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    TextField,
    Chip,
    Alert,
    LinearProgress,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    CloudUpload,
    AttachFile,
    CheckCircle,
    Error,
    Delete,
    InsertDriveFile
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ open, onClose, onUpload, allowedTypes = [], maxSize = 100 * 1024 * 1024 }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileDetails, setFileDetails] = useState({});

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        // Обработка принятых файлов
        const newFiles = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            status: 'pending',
            progress: 0,
            error: null
        }));

        setFiles(prev => [...prev, ...newFiles]);

        // Обработка отклоненных файлов
        if (rejectedFiles.length > 0) {
            const errors = rejectedFiles.map(rejection => ({
                file: rejection.file.name,
                errors: rejection.errors.map(e => e.message)
            }));
            console.error('Rejected files:', errors);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: allowedTypes.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {}),
        maxSize,
        multiple: true
    });

    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const updateFileDetails = (fileId, field, value) => {
        setFileDetails(prev => ({
            ...prev,
            [fileId]: {
                ...prev[fileId],
                [field]: value
            }
        }));
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'ppt':
            case 'pptx':
                return '📊';
            case 'zip':
            case 'rar':
                return '📦';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return '🖼️';
            case 'mp4':
            case 'avi':
            case 'mov':
                return '🎥';
            case 'mp3':
            case 'wav':
                return '🎵';
            default:
                return '📄';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const fileItem = files[i];
                const details = fileDetails[fileItem.id] || {};

                // Создаем FormData для каждого файла
                const formData = new FormData();
                formData.append('file', fileItem.file);
                formData.append('title', details.title || fileItem.file.name);
                formData.append('description', details.description || '');

                // Симуляция загрузки (здесь будет реальный API вызов)
                await new Promise(resolve => {
                    const interval = setInterval(() => {
                        setUploadProgress(prev => {
                            const newProgress = Math.min(prev + 10, (i + 1) / files.length * 100);
                            if (newProgress >= (i + 1) / files.length * 100) {
                                clearInterval(interval);
                                resolve();
                            }
                            return newProgress;
                        });
                    }, 100);
                });

                // Обновляем статус файла
                setFiles(prev => prev.map(f => 
                    f.id === fileItem.id ? { ...f, status: 'uploaded' } : f
                ));
            }

            // Вызываем callback с загруженными файлами
            onUpload && onUpload(files.map(f => ({
                ...f,
                details: fileDetails[f.id]
            })));

            // Закрываем диалог и очищаем состояние
            setTimeout(() => {
                onClose();
                setFiles([]);
                setFileDetails({});
                setUploading(false);
                setUploadProgress(0);
            }, 1000);

        } catch (error) {
            console.error('Upload failed:', error);
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setFiles([]);
            setFileDetails({});
            setUploadProgress(0);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <CloudUpload />
                    <Typography variant="h6">Загрузка файлов</Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Drag & Drop Zone */}
                <DropZone {...getRootProps()} isDragActive={isDragActive}>
                    <input {...getInputProps()} />
                    <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        {isDragActive ? 'Отпустите файлы здесь' : 'Перетащите файлы сюда'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        или
                    </Typography>
                    <Button variant="outlined" startIcon={<AttachFile />}>
                        Выберите файлы
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Максимальный размер файла: {formatFileSize(maxSize)}
                    </Typography>
                </DropZone>

                {/* File List */}
                {files.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Выбранные файлы ({files.length})
                        </Typography>
                        <List>
                            {files.map((fileItem) => (
                                <Paper key={fileItem.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                                    <Box display="flex" alignItems="flex-start" gap={2}>
                                        <Box sx={{ fontSize: 24 }}>
                                            {getFileIcon(fileItem.file.name)}
                                        </Box>
                                        <Box flex={1}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                {fileItem.file.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {formatFileSize(fileItem.file.size)}
                                            </Typography>

                                            {/* File Details Form */}
                                            <Box sx={{ mt: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Название"
                                                    placeholder="Введите название файла"
                                                    value={fileDetails[fileItem.id]?.title || ''}
                                                    onChange={(e) => updateFileDetails(fileItem.id, 'title', e.target.value)}
                                                    sx={{ mb: 1 }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Описание"
                                                    placeholder="Введите описание файла"
                                                    multiline
                                                    rows={2}
                                                    value={fileDetails[fileItem.id]?.description || ''}
                                                    onChange={(e) => updateFileDetails(fileItem.id, 'description', e.target.value)}
                                                />
                                            </Box>

                                            {/* Status */}
                                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {fileItem.status === 'pending' && (
                                                    <Chip label="Ожидает загрузки" size="small" />
                                                )}
                                                {fileItem.status === 'uploaded' && (
                                                    <Chip 
                                                        icon={<CheckCircle />} 
                                                        label="Загружено" 
                                                        color="success" 
                                                        size="small" 
                                                    />
                                                )}
                                                {fileItem.status === 'error' && (
                                                    <Chip 
                                                        icon={<Error />} 
                                                        label="Ошибка" 
                                                        color="error" 
                                                        size="small" 
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Remove Button */}
                                        {!uploading && (
                                            <IconButton 
                                                size="small" 
                                                color="error"
                                                onClick={() => removeFile(fileItem.id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Paper>
                            ))}
                        </List>
                    </Box>
                )}

                {/* Upload Progress */}
                {uploading && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" gutterBottom>
                            Загрузка файлов... {Math.round(uploadProgress)}%
                        </Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress} 
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                )}

                {/* Info Messages */}
                {allowedTypes.length > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            Поддерживаемые типы файлов: {allowedTypes.join(', ')}
                        </Typography>
                    </Alert>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={uploading}>
                    Отмена
                </Button>
                <Button 
                    onClick={handleUpload}
                    variant="contained"
                    disabled={files.length === 0 || uploading}
                    startIcon={<CloudUpload />}
                >
                    {uploading ? 'Загрузка...' : `Загрузить (${files.length})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const DropZone = styled(Paper)(({ theme, isDragActive }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
    backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
    },
}));

export default FileUpload; 