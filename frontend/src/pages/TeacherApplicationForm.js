import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Paper, 
    Typography, 
    Button, 
    Box,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Alert,
    Divider,
    Card,
    CardContent,
    Fade,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import {
    School,
    Person,
    Work,
    MenuBook,
    CheckCircle,
    Send,
    Home,
    Language
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const TeacherApplicationForm = () => {
    const navigate = useNavigate();
    const { themeMode, colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('en');

    // Language content
    const content = {
        en: {
            title: "Teacher Application",
            subtitle: "Join our educational team",
            personal: {
                title: "Personal Information",
                fullName: "Full Name",
                email: "Email",
                phone: "Phone",
                dateOfBirth: "Date of Birth",
                gender: "Gender",
                address: "Address"
            },
            professional: {
                title: "Professional Information",
                experience: "Years of Experience",
                education: "Highest Education",
                university: "University/Institution",
                degree: "Degree",
                specialization: "Specialization",
                teachingSubjects: "Teaching Subjects",
                certifications: "Certifications",
                currentPosition: "Current Position",
                previousWork: "Previous Work Experience"
            },
            motivation: {
                title: "Motivation & Goals",
                whyTeach: "Why do you want to teach?",
                goals: "Your teaching goals",
                methods: "Your teaching methods"
            },
            buttons: {
                submit: "Submit Application",
                cancel: "Cancel"
            },
            success: {
                title: "Application Submitted Successfully!",
                message: "Your teacher application has been received and will be reviewed by our administration team.",
                redirect: "Redirecting to home page..."
            },
            genders: ["Male", "Female", "Other"],
            educationLevels: ["Bachelor's Degree", "Master's Degree", "PhD", "Other"],
            subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Literature", "English", "Computer Science", "Art", "Music", "Physical Education"]
        },
        ru: {
            title: "Заявка учителя",
            subtitle: "Присоединяйтесь к нашей образовательной команде",
            personal: {
                title: "Личная информация",
                fullName: "Полное имя",
                email: "Email",
                phone: "Телефон",
                dateOfBirth: "Дата рождения",
                gender: "Пол",
                address: "Адрес"
            },
            professional: {
                title: "Профессиональная информация",
                experience: "Лет опыта",
                education: "Высшее образование",
                university: "Университет/Учреждение",
                degree: "Степень",
                specialization: "Специализация",
                teachingSubjects: "Преподаваемые предметы",
                certifications: "Сертификаты",
                currentPosition: "Текущая должность",
                previousWork: "Предыдущий опыт работы"
            },
            motivation: {
                title: "Мотивация и цели",
                whyTeach: "Почему вы хотите преподавать?",
                goals: "Ваши цели в преподавании",
                methods: "Ваши методы преподавания"
            },
            buttons: {
                submit: "Подать заявку",
                cancel: "Отмена"
            },
            success: {
                title: "Заявка успешно подана!",
                message: "Ваша заявка на преподавание получена и будет рассмотрена нашей администрацией.",
                redirect: "Перенаправление на главную страницу..."
            },
            genders: ["Мужской", "Женский", "Другой"],
            educationLevels: ["Бакалавр", "Магистр", "PhD", "Другое"],
            subjects: ["Математика", "Физика", "Химия", "Биология", "История", "Литература", "Английский язык", "Информатика", "Искусство", "Музыка", "Физкультура"]
        }
    };

    const currentContent = content[language];

    // Form state
    const [formData, setFormData] = useState({
        // Personal Information
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        
        // Professional Information
        experience: '',
        education: '',
        university: '',
        degree: '',
        specialization: '',
        teachingSubjects: [],
        certifications: '',
        currentPosition: '',
        previousWork: '',
        
        // Motivation
        whyTeach: '',
        goals: '',
        methods: '',
        
        // Additional
        references: '',
        portfolio: '',
        availableStartDate: '',
        salaryExpectation: '',
        additionalSkills: '',
        languages: []
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubjectChange = (subject, checked) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                teachingSubjects: [...prev.teachingSubjects, subject]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                teachingSubjects: prev.teachingSubjects.filter(s => s !== subject)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/teacher-application', formData);
            setSubmitSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while submitting the application');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        return formData.name && 
               formData.email && 
               formData.phone && 
               formData.education && 
               formData.teachingSubjects.length > 0 &&
               formData.whyTeach;
    };

    if (submitSuccess) {
        return (
            <PageContainer themeMode={themeMode} colors={colors}>
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Fade in={submitSuccess}>
                        <Paper 
                            elevation={4}
                            sx={{ 
                                p: 6, 
                                textAlign: 'center',
                                borderRadius: 3,
                                background: themeMode === 'light' ? 'white' : colors.paper
                            }}
                        >
                            <CheckCircle sx={{ fontSize: 100, color: colors.success, mb: 3 }} />
                            <Typography variant="h3" gutterBottom sx={{ fontWeight: 300 }}>
                                {currentContent.success.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
                                {currentContent.success.message}
                            </Typography>
                            <CircularProgress sx={{ mt: 3 }} />
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                {currentContent.success.redirect}
                            </Typography>
                        </Paper>
                    </Fade>
                </Container>
            </PageContainer>
        );
    }

    return (
        <PageContainer themeMode={themeMode} colors={colors}>
            {/* Header */}
            <AppBar position="fixed" sx={{ bgcolor: colors.primary }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        component={Link}
                        to="/"
                        sx={{ mr: 2 }}
                    >
                        <Home />
                    </IconButton>
                    <School sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 300 }}>
                        {currentContent.title}
                    </Typography>
                    <FormControl sx={{ minWidth: 120 }}>
                        <Select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            size="small"
                            sx={{
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                }
                            }}
                        >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="ru">Русский</MenuItem>
                        </Select>
                    </FormControl>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ py: 12 }}>
                <Paper 
                    elevation={4} 
                    sx={{ 
                        p: 4, 
                        borderRadius: 3,
                        background: themeMode === 'light' ? 'white' : colors.paper
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Person sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
                        <Typography variant="h3" sx={{ 
                            fontWeight: 300, 
                            mb: 2,
                            color: colors.text.primary
                        }}>
                            {currentContent.title}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                            color: colors.text.secondary,
                            fontWeight: 300
                        }}>
                            {currentContent.subtitle}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {typeof error === 'string' ? error : error.message || 'Unknown error'}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Personal Information */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: colors.primary,
                                mb: 3
                            }}>
                                <Person sx={{ mr: 1 }} />
                                {currentContent.personal.title}
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.personal.fullName}
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.personal.email}
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.personal.phone}
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.personal.dateOfBirth}
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>{currentContent.personal.gender}</InputLabel>
                                        <Select
                                            value={formData.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                        >
                                            {currentContent.genders.map(option => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.personal.address}
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Professional Information */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: colors.primary,
                                mb: 3
                            }}>
                                <Work sx={{ mr: 1 }} />
                                {currentContent.professional.title}
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.professional.experience}
                                        type="number"
                                        value={formData.experience}
                                        onChange={(e) => handleInputChange('experience', e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>{currentContent.professional.education}</InputLabel>
                                        <Select
                                            value={formData.education}
                                            onChange={(e) => handleInputChange('education', e.target.value)}
                                        >
                                            {currentContent.educationLevels.map(level => (
                                                <MenuItem key={level} value={level}>{level}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.professional.university}
                                        value={formData.university}
                                        onChange={(e) => handleInputChange('university', e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.professional.specialization}
                                        value={formData.specialization}
                                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        {currentContent.professional.teachingSubjects}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {currentContent.subjects.map(subject => (
                                            <FormControlLabel
                                                key={subject}
                                                control={
                                                    <Checkbox
                                                        checked={formData.teachingSubjects.includes(subject)}
                                                        onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                                                    />
                                                }
                                                label={subject}
                                                sx={{ minWidth: '200px' }}
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.professional.previousWork}
                                        multiline
                                        rows={3}
                                        value={formData.previousWork}
                                        onChange={(e) => handleInputChange('previousWork', e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* Motivation */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: colors.primary,
                                mb: 3
                            }}>
                                <MenuBook sx={{ mr: 1 }} />
                                {currentContent.motivation.title}
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.motivation.whyTeach}
                                        multiline
                                        rows={4}
                                        value={formData.whyTeach}
                                        onChange={(e) => handleInputChange('whyTeach', e.target.value)}
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.motivation.goals}
                                        multiline
                                        rows={3}
                                        value={formData.goals}
                                        onChange={(e) => handleInputChange('goals', e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label={currentContent.motivation.methods}
                                        multiline
                                        rows={3}
                                        value={formData.methods}
                                        onChange={(e) => handleInputChange('methods', e.target.value)}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Submit Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                onClick={() => navigate('/')}
                                variant="text"
                                size="large"
                            >
                                {currentContent.buttons.cancel}
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading || !validateForm()}
                                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                                variant="contained"
                                size="large"
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    bgcolor: colors.primary,
                                    '&:hover': {
                                        bgcolor: colors.primaryDark
                                    }
                                }}
                            >
                                {loading ? 'Submitting...' : currentContent.buttons.submit}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </PageContainer>
    );
};

export default TeacherApplicationForm;

// Styled Components
const PageContainer = styled(Box)(({ themeMode, colors }) => ({
    minHeight: '100vh',
    background: themeMode === 'light' 
        ? `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`
        : `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`
})); 