import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Paper,
    Avatar,
    Divider
} from '@mui/material';
import {
    Search,
    LibraryBooks,
    Download,
    Visibility,
    PictureAsPdf,
    VideoLibrary,
    Archive,
    Description,
    Image,
    Code,
    FilterList
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';

const StudentLibrary = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedFileType, setSelectedFileType] = useState('');
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        // Симуляция загрузки материалов
        const mockMaterials = [
            {
                id: 1,
                title: 'Лекция 1 - Введение в HTML',
                description: 'Основы HTML разметки, теги, атрибуты',
                fileName: 'lecture_01_html_intro.pdf',
                fileType: 'pdf',
                fileSize: '2.5 MB',
                subject: 'Frontend Development',
                teacher: 'Иванов И.И.',
                uploadDate: '2024-01-05T10:00:00',
                downloadCount: 23
            },
            {
                id: 2,
                title: 'Практические примеры CSS',
                description: 'Сборник примеров CSS стилей и анимаций',
                fileName: 'css_examples.zip',
                fileType: 'zip',
                fileSize: '8.2 MB',
                subject: 'Frontend Development',
                teacher: 'Иванов И.И.',
                uploadDate: '2024-01-08T14:30:00',
                downloadCount: 21
            },
            {
                id: 3,
                title: 'Видео урок - Flexbox Layout',
                description: 'Подробный разбор Flexbox с примерами',
                fileName: 'flexbox_tutorial.mp4',
                fileType: 'mp4',
                fileSize: '45.6 MB',
                subject: 'Frontend Development',
                teacher: 'Иванов И.И.',
                uploadDate: '2024-01-10T09:15:00',
                downloadCount: 19
            },
            {
                id: 4,
                title: 'Шпаргалка по JavaScript',
                description: 'Краткий справочник по основным методам JavaScript',
                fileName: 'js_cheatsheet.pdf',
                fileType: 'pdf',
                fileSize: '1.8 MB',
                subject: 'JavaScript Advanced',
                teacher: 'Петров П.П.',
                uploadDate: '2024-01-12T16:45:00',
                downloadCount: 25
            },
            {
                id: 5,
                title: 'Исходный код проектов',
                description: 'Примеры кода для всех практических заданий',
                fileName: 'source_code_examples.zip',
                fileType: 'zip',
                fileSize: '12.3 MB',
                subject: 'JavaScript Advanced',
                teacher: 'Петров П.П.',
                uploadDate: '2024-01-15T11:20:00',
                downloadCount: 18
            },
            {
                id: 6,
                title: 'React - Введение в компоненты',
                description: 'Презентация по основам React компонентов',
                fileName: 'react_components_intro.pptx',
                fileType: 'pptx',
                fileSize: '5.1 MB',
                subject: 'React Development',
                teacher: 'Сидорова А.А.',
                uploadDate: '2024-01-18T13:00:00',
                downloadCount: 15
            }
        ];

        const uniqueSubjects = [...new Set(mockMaterials.map(m => m.subject))];
        
        setMaterials(mockMaterials);
        setFilteredMaterials(mockMaterials);
        setSubjects(uniqueSubjects);
    }, []);

    useEffect(() => {
        let filtered = materials;

        // Фильтрация по поиску
        if (searchTerm) {
            filtered = filtered.filter(material =>
                material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                material.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Фильтрация по предмету
        if (selectedSubject) {
            filtered = filtered.filter(material => material.subject === selectedSubject);
        }

        // Фильтрация по типу файла
        if (selectedFileType) {
            filtered = filtered.filter(material => material.fileType === selectedFileType);
        }

        setFilteredMaterials(filtered);
    }, [searchTerm, selectedSubject, selectedFileType, materials]);

    const getFileIcon = (fileType) => {
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return <PictureAsPdf sx={{ color: '#f44336' }} />;
            case 'mp4':
            case 'avi':
            case 'mov':
                return <VideoLibrary sx={{ color: '#9c27b0' }} />;
            case 'zip':
            case 'rar':
                return <Archive sx={{ color: '#ff9800' }} />;
            case 'pptx':
            case 'ppt':
                return <Description sx={{ color: '#ff5722' }} />;
            case 'docx':
            case 'doc':
                return <Description sx={{ color: '#2196f3' }} />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Image sx={{ color: '#4caf50' }} />;
            default:
                return <Description sx={{ color: '#757575' }} />;
        }
    };

    const getFileTypeColor = (fileType) => {
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return 'error';
            case 'mp4':
            case 'avi':
            case 'mov':
                return 'secondary';
            case 'zip':
            case 'rar':
                return 'warning';
            default:
                return 'primary';
        }
    };

    const formatFileSize = (size) => {
        const sizeInMB = parseFloat(size);
        if (sizeInMB < 1) {
            return `${Math.round(sizeInMB * 1024)} KB`;
        }
        return `${sizeInMB} MB`;
    };

    const handleDownload = (material) => {
        // Здесь будет логика скачивания файла
        console.log('Downloading:', material.fileName);
        // Имитация увеличения счетчика загрузок
        setMaterials(prev => prev.map(m => 
            m.id === material.id ? { ...m, downloadCount: m.downloadCount + 1 } : m
        ));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSubject('');
        setSelectedFileType('');
    };

    const fileTypes = [...new Set(materials.map(m => m.fileType))];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
                Библиотека материалов
            </Typography>

            {/* Панель фильтров */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Поиск материалов..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Предмет</InputLabel>
                            <Select
                                value={selectedSubject}
                                label="Предмет"
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <MenuItem value="">Все предметы</MenuItem>
                                {subjects.map((subject) => (
                                    <MenuItem key={subject} value={subject}>
                                        {subject}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Тип файла</InputLabel>
                            <Select
                                value={selectedFileType}
                                label="Тип файла"
                                onChange={(e) => setSelectedFileType(e.target.value)}
                            >
                                <MenuItem value="">Все типы</MenuItem>
                                {fileTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type.toUpperCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={clearFilters}
                        >
                            Сбросить
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Статистика */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body1" color="text.secondary">
                    Найдено материалов: {filteredMaterials.length}
                </Typography>
            </Box>

            {/* Список материалов */}
            {filteredMaterials.length === 0 ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                    <LibraryBooks sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Материалы не найдены
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Попробуйте изменить параметры поиска
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredMaterials.map((material) => (
                        <Grid item xs={12} key={material.id}>
                            <StyledMaterialCard elevation={2}>
                                <CardContent>
                                    <Box display="flex" alignItems="flex-start" gap={2}>
                                        {/* Иконка файла */}
                                        <Avatar
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                bgcolor: 'background.paper',
                                                border: '2px solid',
                                                borderColor: 'divider'
                                            }}
                                        >
                                            {getFileIcon(material.fileType)}
                                        </Avatar>

                                        {/* Информация о файле */}
                                        <Box flex={1}>
                                            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                                                <Typography variant="h6" component="div">
                                                    {material.title}
                                                </Typography>
                                                <Chip
                                                    label={material.fileType.toUpperCase()}
                                                    size="small"
                                                    color={getFileTypeColor(material.fileType)}
                                                />
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {material.description}
                                            </Typography>

                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Предмет:</strong> {material.subject}
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Преподаватель:</strong> {material.teacher}
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Размер:</strong> {material.fileSize}
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Загружено:</strong> {new Date(material.uploadDate).toLocaleDateString('ru-RU')}
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Скачиваний:</strong> {material.downloadCount}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Действия */}
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<Download />}
                                                onClick={() => handleDownload(material)}
                                            >
                                                Скачать
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Visibility />}
                                            >
                                                Просмотр
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </StyledMaterialCard>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Сводка по предметам */}
            <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Материалы по предметам
                </Typography>
                <Grid container spacing={2}>
                    {subjects.map((subject) => {
                        const subjectMaterials = materials.filter(m => m.subject === subject);
                        const totalSize = subjectMaterials.reduce((acc, m) => {
                            const size = parseFloat(m.fileSize);
                            return acc + size;
                        }, 0);

                        return (
                            <Grid item xs={12} sm={6} md={4} key={subject}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {subject}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {subjectMaterials.length} материалов
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Общий размер: {totalSize.toFixed(1)} MB
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>
        </Container>
    );
};

const StyledMaterialCard = styled(Card)(({ theme }) => ({
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
    },
}));

export default StudentLibrary; 