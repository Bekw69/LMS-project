import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Container, 
    Paper, 
    Typography, 
    Stepper, 
    Step, 
    StepLabel, 
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
    Chip,
    CircularProgress,
    Alert,
    Avatar,
    Card,
    CardContent,
    Divider,
    Fade,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import {
    Person,
    School,
    Schedule,
    CheckCircle,
    People,
    MenuBook,
    AccessTime,
    SportsEsports,
    HealthAndSafety,
    Language,
    AttachFile,
    ArrowBack,
    ArrowForward,
    PersonAdd,
    Home
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const StudentRegistrationForm = () => {
    const navigate = useNavigate();
    const { themeMode, colors } = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState('en');
    
    // Данные классов и предметов
    const [availableClasses, setAvailableClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [schools, setSchools] = useState([]);

    // Language content
    const content = {
        en: {
            title: "Student Registration",
            subtitle: "Join our educational community",
            steps: [
                'Personal Information',
                'Parents Information', 
                'Education History',
                'Class & Subjects',
                'Schedule Preferences',
                'Additional Information',
                'Documents'
            ],
            personal: {
                title: "Personal Information",
                fullName: "Full Name",
                email: "Email",
                phone: "Phone",
                dateOfBirth: "Date of Birth",
                gender: "Gender",
                address: "Address",
                street: "Street",
                city: "City",
                state: "State/Region",
                zipCode: "ZIP Code"
            },
            parents: {
                title: "Parents/Guardians Information",
                father: "Father",
                mother: "Mother", 
                fatherName: "Father's Name",
                fatherPhone: "Father's Phone",
                motherName: "Mother's Name",
                motherPhone: "Mother's Phone"
            },
            education: {
                title: "Previous Education",
                schoolName: "Previous School Name",
                graduationYear: "Graduation Year"
            },
            classSubjects: {
                title: "Class & Subjects Selection",
                school: "School",
                class: "Class",
                selectSubjects: "Select subjects to study:"
            },
            schedule: {
                title: "Schedule Preferences",
                startTime: "Preferred start time",
                maxHours: "Maximum hours per day",
                preferredDays: "Preferred days of the week:"
            },
            additional: {
                title: "Additional Information",
                activities: "Extracurricular Activities",
                addActivity: "Add Activity"
            },
            documents: {
                title: "Documents (Optional)",
                info: "You can upload documents now or provide them later",
                laterInfo: "After approval, you will have the opportunity to upload all necessary documents."
            },
            buttons: {
                back: "Back",
                next: "Next", 
                submit: "Submit Application",
                cancel: "Cancel"
            },
            success: {
                title: "Application Submitted Successfully!",
                message: "Your student registration application has been received and will be reviewed by the school administration.",
                redirect: "Redirecting to login page..."
            },
            genders: ["Male", "Female", "Other"],
            languageLevels: ["Beginner", "Intermediate", "Advanced", "Native"],
            activityLevels: ["Beginner", "Intermediate", "Advanced"],
            daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        },
        ru: {
            title: "Регистрация студента",
            subtitle: "Присоединяйтесь к нашему образовательному сообществу",
            steps: [
                'Личная информация',
                'Информация о родителях',
                'История образования', 
                'Класс и предметы',
                'Предпочтения расписания',
                'Дополнительная информация',
                'Документы'
            ],
            personal: {
                title: "Личная информация",
                fullName: "Полное имя",
                email: "Email",
                phone: "Телефон",
                dateOfBirth: "Дата рождения",
                gender: "Пол",
                address: "Адрес",
                street: "Улица",
                city: "Город",
                state: "Область/Регион",
                zipCode: "Почтовый индекс"
            },
            parents: {
                title: "Информация о родителях/опекунах",
                father: "Отец",
                mother: "Мать",
                fatherName: "Имя отца",
                fatherPhone: "Телефон отца",
                motherName: "Имя матери",
                motherPhone: "Телефон матери"
            },
            education: {
                title: "Предыдущее образование",
                schoolName: "Название предыдущей школы",
                graduationYear: "Год окончания"
            },
            classSubjects: {
                title: "Выбор класса и предметов",
                school: "Школа",
                class: "Класс", 
                selectSubjects: "Выберите предметы для изучения:"
            },
            schedule: {
                title: "Предпочтения по расписанию",
                startTime: "Предпочитаемое время начала",
                maxHours: "Максимум часов в день",
                preferredDays: "Предпочитаемые дни недели:"
            },
            additional: {
                title: "Дополнительная информация",
                activities: "Внеклассные активности",
                addActivity: "Добавить активность"
            },
            documents: {
                title: "Документы (необязательно)",
                info: "Вы можете загрузить документы сейчас или предоставить их позже",
                laterInfo: "После одобрения заявки вам будет предоставлена возможность загрузить все необходимые документы."
            },
            buttons: {
                back: "Назад",
                next: "Далее",
                submit: "Подать заявку", 
                cancel: "Отмена"
            },
            success: {
                title: "Заявка успешно подана!",
                message: "Ваша заявка на регистрацию получена и будет рассмотрена администрацией школы.",
                redirect: "Перенаправление на страницу входа..."
            },
            genders: ["Мужской", "Женский", "Другой"],
            languageLevels: ["Начальный", "Средний", "Продвинутый", "Родной"],
            activityLevels: ["Начинающий", "Средний", "Продвинутый"],
            daysOfWeek: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
        }
    };

    const currentContent = content[language];

    // Состояние формы
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Kazakhstan'
        },
        parentInfo: {
            fatherName: '',
            fatherPhone: '',
            fatherEmail: '',
            fatherOccupation: '',
            motherName: '',
            motherPhone: '',
            motherEmail: '',
            motherOccupation: '',
            guardianName: '',
            guardianPhone: '',
            guardianEmail: '',
            guardianRelation: ''
        },
        previousEducation: {
            schoolName: '',
            graduationYear: '',
            grade: '',
            certificates: []
        },
        selectedClass: '',
        selectedSubjects: [],
        schedulePreferences: {
            preferredStartTime: '08:00',
            preferredDays: [],
            maxHoursPerDay: 6,
            breakPreferences: {
                lunchBreak: true,
                shortBreaks: true
            }
        },
        extracurricularActivities: [],
        specialNeeds: {
            hasDisability: false,
            disabilityDescription: '',
            accommodationsNeeded: [],
            medicalConditions: [],
            allergies: [],
            dietaryRestrictions: []
        },
        languagePreferences: {
            primaryLanguage: language === 'ru' ? 'Русский' : 'English',
            secondaryLanguages: [],
            needsLanguageSupport: false
        },
        documents: {
            photo: '',
            birthCertificate: '',
            previousSchoolRecords: '',
            medicalRecords: '',
            parentIdCopies: [],
            otherDocuments: []
        },
        school: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Загружаем реальные данные с сервера
            const [schoolsResponse, classesResponse, subjectsResponse] = await Promise.all([
                axios.get('/AllAdmins').catch(() => ({ data: [] })),
                axios.get('/AllClasses').catch(() => ({ data: [] })),
                axios.get('/AllSubjects').catch(() => ({ data: [] }))
            ]);

            setSchools(schoolsResponse.data.length > 0 ? schoolsResponse.data : [
                { _id: '1', schoolName: 'Future School' },
                { _id: '2', schoolName: 'Innovation Academy' }
            ]);
            
            setAvailableClasses(classesResponse.data.length > 0 ? classesResponse.data : [
                { _id: '1', sclassName: '10A' },
                { _id: '2', sclassName: '10B' },
                { _id: '3', sclassName: '11A' }
            ]);

            setSubjects(subjectsResponse.data.length > 0 ? subjectsResponse.data : [
                { _id: '1', subName: 'Mathematics' },
                { _id: '2', subName: 'Physics' },
                { _id: '3', subName: 'Chemistry' },
                { _id: '4', subName: 'Biology' },
                { _id: '5', subName: 'History' },
                { _id: '6', subName: 'Literature' }
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
            // Используем заглушки в случае ошибки
            setSchools([
                { _id: '1', schoolName: 'Future School' },
                { _id: '2', schoolName: 'Innovation Academy' }
            ]);
            
            setAvailableClasses([
                { _id: '1', sclassName: '10A' },
                { _id: '2', sclassName: '10B' },
                { _id: '3', sclassName: '11A' }
            ]);

            setSubjects([
                { _id: '1', subName: 'Mathematics' },
                { _id: '2', subName: 'Physics' },
                { _id: '3', subName: 'Chemistry' },
                { _id: '4', subName: 'Biology' },
                { _id: '5', subName: 'History' },
                { _id: '6', subName: 'Literature' }
            ]);
        }
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const validateStep = (step) => {
        switch (step) {
            case 0: // Личная информация
                return formData.name && formData.email && formData.phone && formData.dateOfBirth && formData.gender;
            case 1: // Родители
                return formData.parentInfo.fatherName || formData.parentInfo.motherName || formData.parentInfo.guardianName;
            case 2: // Образование
                return formData.previousEducation.schoolName;
            case 3: // Класс и предметы
                return formData.selectedClass && formData.selectedSubjects.length > 0;
            case 4: // Расписание
                return formData.schedulePreferences.preferredDays.length > 0;
            case 5: // Дополнительная информация
                return true; // Необязательно
            case 6: // Документы
                return true; // Необязательно на данном этапе
            default:
                return true;
        }
    };

    const handleInputChange = (field, value, nestedField = null) => {
        if (nestedField) {
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [nestedField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubjectChange = (subjectId, checked) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                selectedSubjects: [...prev.selectedSubjects, {
                    subject: subjectId,
                    priority: 3,
                    reason: ''
                }]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                selectedSubjects: prev.selectedSubjects.filter(s => s.subject !== subjectId)
            }));
        }
    };

    const handleActivityAdd = () => {
        const newActivity = {
            activity: '',
            level: currentContent.activityLevels[0],
            timeCommitment: ''
        };
        setFormData(prev => ({
            ...prev,
            extracurricularActivities: [...prev.extracurricularActivities, newActivity]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/student-registration', formData);
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

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return renderPersonalInfo();
            case 1:
                return renderParentInfo();
            case 2:
                return renderEducationInfo();
            case 3:
                return renderClassAndSubjects();
            case 4:
                return renderSchedulePreferences();
            case 5:
                return renderAdditionalInfo();
            case 6:
                return renderDocuments();
            default:
                return null;
        }
    };

    const renderPersonalInfo = () => (
        <StepCard themeMode={themeMode} colors={colors}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ mr: 2, bgcolor: colors.primary }}>
                        <Person />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {currentContent.personal.title}
                    </Typography>
                </Box>
                
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
                            required
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
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
                    
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {currentContent.personal.address}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label={currentContent.personal.street}
                            value={formData.address.street}
                            onChange={(e) => handleInputChange('address', e.target.value, 'street')}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label={currentContent.personal.city}
                            value={formData.address.city}
                            onChange={(e) => handleInputChange('address', e.target.value, 'city')}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label={currentContent.personal.state}
                            value={formData.address.state}
                            onChange={(e) => handleInputChange('address', e.target.value, 'state')}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label={currentContent.personal.zipCode}
                            value={formData.address.zipCode}
                            onChange={(e) => handleInputChange('address', e.target.value, 'zipCode')}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </StepCard>
    );

    const renderParentInfo = () => (
        <StepCard themeMode={themeMode} colors={colors}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ mr: 2, bgcolor: colors.accent }}>
                        <People />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {currentContent.parents.title}
                    </Typography>
                </Box>
                
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            {currentContent.parents.father}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={currentContent.parents.fatherName}
                            value={formData.parentInfo.fatherName}
                            onChange={(e) => handleInputChange('parentInfo', e.target.value, 'fatherName')}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={currentContent.parents.fatherPhone}
                            value={formData.parentInfo.fatherPhone}
                            onChange={(e) => handleInputChange('parentInfo', e.target.value, 'fatherPhone')}
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                            {currentContent.parents.mother}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={currentContent.parents.motherName}
                            value={formData.parentInfo.motherName}
                            onChange={(e) => handleInputChange('parentInfo', e.target.value, 'motherName')}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={currentContent.parents.motherPhone}
                            value={formData.parentInfo.motherPhone}
                            onChange={(e) => handleInputChange('parentInfo', e.target.value, 'motherPhone')}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </StepCard>
    );

    const renderEducationInfo = () => (
        <StepCard themeMode={themeMode} colors={colors}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ mr: 2, bgcolor: colors.success }}>
                        <School />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {currentContent.education.title}
                    </Typography>
                </Box>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label={currentContent.education.schoolName}
                            value={formData.previousEducation.schoolName}
                            onChange={(e) => handleInputChange('previousEducation', e.target.value, 'schoolName')}
                            required
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label={currentContent.education.graduationYear}
                            type="number"
                            value={formData.previousEducation.graduationYear}
                            onChange={(e) => handleInputChange('previousEducation', e.target.value, 'graduationYear')}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </StepCard>
    );

    const renderClassAndSubjects = () => (
        <StepCard themeMode={themeMode} colors={colors}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ mr: 2, bgcolor: colors.warning }}>
                        <MenuBook />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {currentContent.classSubjects.title}
                    </Typography>
                </Box>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>{currentContent.classSubjects.school}</InputLabel>
                            <Select
                                value={formData.school}
                                onChange={(e) => handleInputChange('school', e.target.value)}
                            >
                                {schools.map(school => (
                                    <MenuItem key={school._id} value={school._id}>
                                        {school.schoolName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>{currentContent.classSubjects.class}</InputLabel>
                            <Select
                                value={formData.selectedClass}
                                onChange={(e) => handleInputChange('selectedClass', e.target.value)}
                            >
                                {availableClasses.map(cls => (
                                    <MenuItem key={cls._id} value={cls._id}>
                                        {cls.sclassName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            {currentContent.classSubjects.selectSubjects}
                        </Typography>
                        <Grid container spacing={2}>
                            {subjects.map(subject => (
                                <Grid item xs={12} sm={6} md={4} key={subject._id}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.selectedSubjects.some(s => s.subject === subject._id)}
                                                onChange={(e) => handleSubjectChange(subject._id, e.target.checked)}
                                            />
                                        }
                                        label={subject.subName}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </StepCard>
    );

    const renderSchedulePreferences = () => (
        <StepCard themeMode={themeMode} colors={colors}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ mr: 2, bgcolor: colors.info }}>
                        <Schedule />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {currentContent.schedule.title}
                    </Typography>
                </Box>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>{currentContent.schedule.startTime}</InputLabel>
                            <Select
                                value={formData.schedulePreferences.preferredStartTime}
                                onChange={(e) => handleInputChange('schedulePreferences', e.target.value, 'preferredStartTime')}
                            >
                                <MenuItem value="08:00">08:00</MenuItem>
                                <MenuItem value="09:00">09:00</MenuItem>
                                <MenuItem value="10:00">10:00</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label={currentContent.schedule.maxHours}
                            type="number"
                            value={formData.schedulePreferences.maxHoursPerDay}
                            onChange={(e) => handleInputChange('schedulePreferences', parseInt(e.target.value), 'maxHoursPerDay')}
                            inputProps={{ min: 4, max: 8 }}
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            {currentContent.schedule.preferredDays}
                        </Typography>
                        <Grid container spacing={1}>
                            {currentContent.daysOfWeek.map(day => (
                                <Grid item key={day}>
                                    <Chip
                                        label={day}
                                        clickable
                                        color={formData.schedulePreferences.preferredDays.includes(day) ? 'primary' : 'default'}
                                        onClick={() => {
                                            const days = formData.schedulePreferences.preferredDays;
                                            const newDays = days.includes(day) 
                                                ? days.filter(d => d !== day)
                                                : [...days, day];
                                            handleInputChange('schedulePreferences', newDays, 'preferredDays');
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </StepCard>
    );

    const renderAdditionalInfo = () => (
        <StepCard themeMode={themeMode} colors={colors}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ mr: 2, bgcolor: colors.secondary }}>
                        <SportsEsports />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {currentContent.additional.title}
                    </Typography>
                </Box>
                
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">{currentContent.additional.activities}</Typography>
                            <Button onClick={handleActivityAdd} variant="outlined" size="small">
                                {currentContent.additional.addActivity}
                            </Button>
                        </Box>
                    </Grid>

                    {formData.extracurricularActivities.map((activity, index) => (
                        <Grid item xs={12} key={index}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Activity"
                                            value={activity.activity}
                                            onChange={(e) => {
                                                const newActivities = [...formData.extracurricularActivities];
                                                newActivities[index].activity = e.target.value;
                                                handleInputChange('extracurricularActivities', newActivities);
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Level</InputLabel>
                                            <Select
                                                value={activity.level}
                                                onChange={(e) => {
                                                    const newActivities = [...formData.extracurricularActivities];
                                                    newActivities[index].level = e.target.value;
                                                    handleInputChange('extracurricularActivities', newActivities);
                                                }}
                                            >
                                                {currentContent.activityLevels.map(level => (
                                                    <MenuItem key={level} value={level}>{level}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Time per week"
                                            value={activity.timeCommitment}
                                            onChange={(e) => {
                                                const newActivities = [...formData.extracurricularActivities];
                                                newActivities[index].timeCommitment = e.target.value;
                                                handleInputChange('extracurricularActivities', newActivities);
                                            }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </StepCard>
    );

    const renderDocuments = () => (
        <StepCard themeMode={themeMode} colors={colors}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ mr: 2, bgcolor: colors.error }}>
                        <AttachFile />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {currentContent.documents.title}
                    </Typography>
                </Box>
                
                <Typography variant="body1" color="textSecondary" paragraph>
                    {currentContent.documents.info}
                </Typography>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                    {currentContent.documents.laterInfo}
                </Alert>
            </CardContent>
        </StepCard>
    );

    if (submitSuccess) {
        return (
            <PageContainer themeMode={themeMode} colors={colors}>
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Fade in={submitSuccess}>
                        <SuccessCard themeMode={themeMode} colors={colors}>
                            <CardContent sx={{ p: 6, textAlign: 'center' }}>
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
                            </CardContent>
                        </SuccessCard>
                    </Fade>
                </Container>
            </PageContainer>
        );
    }

    return (
        <PageContainer themeMode={themeMode} colors={colors}>
            {/* Fixed Header */}
            <StyledAppBar position="fixed" themeMode={themeMode} colors={colors}>
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
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 300 }}>
                            {currentContent.title}
                        </Typography>
                    </Box>
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
            </StyledAppBar>

            <Container maxWidth="lg" sx={{ py: 12 }}>
                <MainCard themeMode={themeMode} colors={colors}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
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

                        {/* Stepper */}
                        <StepperContainer themeMode={themeMode} colors={colors}>
                            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                                {currentContent.steps.map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </StepperContainer>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {typeof error === 'string' ? error : error.message || 'Unknown error'}
                            </Alert>
                        )}

                        {/* Step Content */}
                        <Box sx={{ minHeight: 400, mb: 4 }}>
                            {renderStepContent(activeStep)}
                        </Box>

                        {/* Navigation */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                startIcon={<ArrowBack />}
                                variant="outlined"
                                size="large"
                            >
                                {currentContent.buttons.back}
                            </Button>
                            
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="text"
                                    size="large"
                                >
                                    {currentContent.buttons.cancel}
                                </Button>

                                {activeStep === currentContent.steps.length - 1 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                                            minWidth: 180
                                        }}
                                    >
                                        {loading ? 'Submitting...' : currentContent.buttons.submit}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        disabled={!validateStep(activeStep)}
                                        endIcon={<ArrowForward />}
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                                            minWidth: 140
                                        }}
                                    >
                                        {currentContent.buttons.next}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </MainCard>
            </Container>
        </PageContainer>
    );
};

export default StudentRegistrationForm;

// Styled Components
const PageContainer = styled(Box)(({ themeMode, colors }) => ({
    minHeight: '100vh',
    background: themeMode === 'light' 
        ? `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`
        : `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`
}));

const StyledAppBar = styled(AppBar)(({ themeMode, colors }) => ({
    background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    backdropFilter: 'blur(20px)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
}));

const MainCard = styled(Card)(({ themeMode, colors }) => ({
    borderRadius: 24,
    background: themeMode === 'light'
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(26, 26, 26, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.divider}`,
    boxShadow: themeMode === 'light'
        ? '0px 16px 48px rgba(139, 21, 56, 0.08)'
        : '0px 16px 48px rgba(0, 0, 0, 0.4)'
}));

const StepperContainer = styled(Box)(({ themeMode, colors }) => ({
    padding: '24px',
    borderRadius: 16,
    background: themeMode === 'light'
        ? colors.surface
        : colors.paper,
    border: `1px solid ${colors.divider}`
}));

const StepCard = styled(Card)(({ themeMode, colors }) => ({
    borderRadius: 16,
    border: `1px solid ${colors.divider}`,
    background: themeMode === 'light'
        ? colors.surface
        : colors.paper,
    boxShadow: 'none'
}));

const SuccessCard = styled(Card)(({ themeMode, colors }) => ({
    borderRadius: 24,
    background: themeMode === 'light'
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(26, 26, 26, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.success}`,
    boxShadow: themeMode === 'light'
        ? `0px 16px 48px ${colors.success}20`
        : `0px 16px 48px ${colors.success}40`
})); 