import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Container, 
    Grid, 
    Box, 
    Button, 
    Typography, 
    Card, 
    CardContent, 
    Avatar,
    AppBar,
    Toolbar,
    Paper,
    Chip,
    Select,
    MenuItem,
    FormControl,
    IconButton
} from '@mui/material';
import { 
    School, 
    EmojiEvents, 
    Groups, 
    MenuBook,
    Star,
    WorkspacePremium,
    Person,
    PersonAdd,
    AutoAwesome,
    Psychology,
    TrendingUp,
    Language,
    Login as LoginIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';

const Homepage = () => {
    const { themeMode, colors } = useTheme();
    const [stars, setStars] = useState([]);
    const [language, setLanguage] = useState('en');

    // Language content
    const content = {
        en: {
            schoolName: "Future School",
            heroTitle: "Excellence in Education",
            heroSubtitle: "Empowering minds, building futures through innovative learning and dedicated teaching",
            registerStudent: "Register as Student",
            teacherApplication: "Apply as Teacher",
            login: "Login",
            whyChooseUs: "Why Choose Us",
            whyChooseSubtitle: "Discover what makes our school community exceptional",
            ourTeachersTitle: "Our Teachers",
            ourTeachersDesc: "Dedicated educators with advanced degrees and years of experience, committed to nurturing every student's potential",
            ourGraduatesTitle: "Our Graduates",
            ourGraduatesDesc: "Alumni who have gone on to prestigious universities and successful careers worldwide, making us proud",
            ourFacilitiesTitle: "Our Facilities",
            ourFacilitiesDesc: "State-of-the-art classrooms, laboratories, and recreational facilities designed for optimal learning",
            stats: {
                students: "Students",
                teachers: "Teachers", 
                graduates: "Graduates",
                awards: "Awards"
            },
            joinCommunity: "Join Our Community",
            joinSubtitle: "Be part of an educational journey that transforms lives",
            footerText: "Building tomorrow's leaders today"
        },
        ru: {
            schoolName: "Школа Будущего",
            heroTitle: "Превосходство в образовании",
            heroSubtitle: "Развиваем умы, строим будущее через инновационное обучение и преданное преподавание",
            registerStudent: "Регистрация студента",
            teacherApplication: "Заявка учителя",
            login: "Войти",
            whyChooseUs: "Почему выбирают нас",
            whyChooseSubtitle: "Узнайте, что делает наше школьное сообщество исключительным",
            ourTeachersTitle: "Наши учителя",
            ourTeachersDesc: "Преданные педагоги с высшим образованием и многолетним опытом, стремящиеся развить потенциал каждого студента",
            ourGraduatesTitle: "Наши выпускники",
            ourGraduatesDesc: "Выпускники, поступившие в престижные университеты и построившие успешную карьеру по всему миру",
            ourFacilitiesTitle: "Наши возможности",
            ourFacilitiesDesc: "Современные классы, лаборатории и рекреационные помещения, созданные для оптимального обучения",
            stats: {
                students: "Студентов",
                teachers: "Учителей",
                graduates: "Выпускников", 
                awards: "Наград"
            },
            joinCommunity: "Присоединяйтесь к нам",
            joinSubtitle: "Станьте частью образовательного путешествия, которое меняет жизни",
            footerText: "Воспитываем лидеров завтрашнего дня"
        }
    };

    // Создаем падающие звездочки-оригами
    useEffect(() => {
        const createStars = () => {
            const newStars = [];
            for (let i = 0; i < 30; i++) {
                newStars.push({
                    id: i,
                    left: Math.random() * 100,
                    animationDelay: Math.random() * 20,
                    animationDuration: 15 + Math.random() * 10,
                    size: 0.5 + Math.random() * 1,
                    opacity: 0.2 + Math.random() * 0.5
                });
            }
            setStars(newStars);
        };

        createStars();
    }, []);

    const currentContent = content[language];

    return (
        <PageContainer themeMode={themeMode} colors={colors}>
            {/* Падающие звездочки-оригами */}
            <StarsContainer>
                {stars.map(star => (
                    <FallingStar
                        key={star.id}
                        style={{
                            left: `${star.left}%`,
                            animationDelay: `${star.animationDelay}s`,
                            animationDuration: `${star.animationDuration}s`,
                            fontSize: `${star.size}rem`,
                            opacity: star.opacity
                        }}
                        themeMode={themeMode}
                    >
                        ✦
                    </FallingStar>
                ))}
            </StarsContainer>

            {/* Fixed Header Navigation */}
            <StyledAppBar position="fixed" themeMode={themeMode} colors={colors}>
                <Toolbar sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <School sx={{ mr: 2, fontSize: 32 }} />
                        <Typography variant="h5" component="div" sx={{ 
                            fontWeight: 300,
                            letterSpacing: '-0.02em'
                        }}>
                            {currentContent.schoolName}
                        </Typography>
                    </Box>
                    
                    {/* Language Selector */}
                    <FormControl sx={{ mr: 2, minWidth: 120 }}>
                        <Select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            size="small"
                            startAdornment={<Language sx={{ mr: 1 }} />}
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

                    {/* Simple Login Button */}
                    <Button 
                        variant="contained"
                        component={Link} 
                        to="/login"
                        startIcon={<LoginIcon />}
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    >
                        {currentContent.login}
                    </Button>
                </Toolbar>
            </StyledAppBar>

            {/* Hero Section */}
            <HeroSection themeMode={themeMode} colors={colors}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ position: 'relative', zIndex: 2 }}>
                                <Typography 
                                    variant="h1" 
                                    sx={{ 
                                        fontWeight: 200,
                                        fontSize: { xs: '2.5rem', md: '4rem' },
                                        lineHeight: 1.1,
                                        mb: 3,
                                        color: colors.text.primary
                                    }}
                                >
                                    {currentContent.heroTitle}
                                </Typography>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 300,
                                        mb: 4,
                                        color: colors.text.secondary,
                                        lineHeight: 1.6
                                    }}
                                >
                                    {currentContent.heroSubtitle}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                                    <Button 
                                        variant="contained"
                                        size="large"
                                        component={Link} 
                                        to="/student-registration"
                                        startIcon={<PersonAdd />}
                                        sx={{
                                            borderRadius: 2,
                                            px: 4,
                                            py: 1.5,
                                            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)'
                                            }
                                        }}
                                    >
                                        {currentContent.registerStudent}
                                    </Button>
                                    <Button 
                                        variant="outlined"
                                        size="large"
                                        component={Link} 
                                        to="/teacher-application"
                                        startIcon={<Person />}
                                        sx={{
                                            borderRadius: 2,
                                            px: 4,
                                            py: 1.5,
                                            borderColor: colors.primary,
                                            color: colors.primary,
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                borderColor: colors.primaryDark,
                                                bgcolor: 'rgba(139, 21, 56, 0.05)'
                                            }
                                        }}
                                    >
                                        {currentContent.teacherApplication}
                                    </Button>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <FeatureChip 
                                        icon={<AutoAwesome />} 
                                        label="Real-time Learning" 
                                        themeMode={themeMode}
                                        colors={colors}
                                    />
                                    <FeatureChip 
                                        icon={<Psychology />} 
                                        label="Academic Excellence" 
                                        themeMode={themeMode}
                                        colors={colors}
                                    />
                                    <FeatureChip 
                                        icon={<TrendingUp />} 
                                        label="Success Analytics" 
                                        themeMode={themeMode}
                                        colors={colors}
                                    />
                                </Box>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <StatsCard themeMode={themeMode} colors={colors}>
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <StatItem>
                                            <Groups sx={{ 
                                                fontSize: 48, 
                                                color: colors.primary, 
                                                mb: 2 
                                            }} />
                                            <Typography variant="h3" sx={{ 
                                                fontWeight: 300, 
                                                mb: 1,
                                                color: colors.text.primary
                                            }}>
                                                1200+
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {currentContent.stats.students}
                                            </Typography>
                                        </StatItem>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <StatItem>
                                            <Person sx={{ 
                                                fontSize: 48, 
                                                color: colors.accent, 
                                                mb: 2 
                                            }} />
                                            <Typography variant="h3" sx={{ 
                                                fontWeight: 300, 
                                                mb: 1,
                                                color: colors.text.primary
                                            }}>
                                                85+
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {currentContent.stats.teachers}
                                            </Typography>
                                        </StatItem>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <StatItem>
                                            <EmojiEvents sx={{ 
                                                fontSize: 48, 
                                                color: colors.success, 
                                                mb: 2 
                                            }} />
                                            <Typography variant="h3" sx={{ 
                                                fontWeight: 300, 
                                                mb: 1,
                                                color: colors.text.primary
                                            }}>
                                                2500+
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {currentContent.stats.graduates}
                                            </Typography>
                                        </StatItem>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <StatItem>
                                            <WorkspacePremium sx={{ 
                                                fontSize: 48, 
                                                color: colors.warning, 
                                                mb: 2 
                                            }} />
                                            <Typography variant="h3" sx={{ 
                                                fontWeight: 300, 
                                                mb: 1,
                                                color: colors.text.primary
                                            }}>
                                                50+
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                {currentContent.stats.awards}
                                            </Typography>
                                        </StatItem>
                                    </Grid>
                                </Grid>
                            </StatsCard>
                        </Grid>
                    </Grid>
                </Container>
            </HeroSection>
            
            {/* Features Section - Our Community */}
            <FeaturesSection themeMode={themeMode} colors={colors}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography 
                            variant="h2" 
                            sx={{ 
                                fontWeight: 300,
                                mb: 3,
                                color: colors.text.primary
                            }}
                        >
                            {currentContent.whyChooseUs}
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: colors.text.secondary,
                                fontWeight: 300,
                                maxWidth: '600px',
                                mx: 'auto'
                            }}
                        >
                            {currentContent.whyChooseSubtitle}
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {[
                            {
                                icon: <Person />,
                                title: currentContent.ourTeachersTitle,
                                description: currentContent.ourTeachersDesc,
                                color: colors.primary
                            },
                            {
                                icon: <EmojiEvents />,
                                title: currentContent.ourGraduatesTitle,
                                description: currentContent.ourGraduatesDesc,
                                color: colors.accent
                            },
                            {
                                icon: <School />,
                                title: currentContent.ourFacilitiesTitle,
                                description: currentContent.ourFacilitiesDesc,
                                color: colors.success
                            }
                        ].map((feature, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <FeatureCard themeMode={themeMode} colors={colors}>
                                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                        <Avatar sx={{ 
                                            width: 80, 
                                            height: 80, 
                                            mx: 'auto', 
                                            mb: 3,
                                            bgcolor: feature.color,
                                            background: `linear-gradient(135deg, ${feature.color} 0%, ${colors.primaryDark} 100%)`
                                        }}>
                                            {React.cloneElement(feature.icon, { sx: { fontSize: 40 } })}
                                        </Avatar>
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                fontWeight: 500,
                                                mb: 2,
                                                color: colors.text.primary
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: colors.text.secondary,
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </FeatureCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </FeaturesSection>

            {/* Call to Action Section */}
            <CTASection themeMode={themeMode} colors={colors}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                            variant="h2" 
                            sx={{ 
                                fontWeight: 300,
                                mb: 3,
                                color: 'white'
                            }}
                        >
                            {currentContent.joinCommunity}
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: 300,
                                mb: 4
                            }}
                        >
                            {currentContent.joinSubtitle}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button 
                                variant="contained"
                                size="large"
                                component={Link} 
                                to="/student-registration"
                                startIcon={<PersonAdd />}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    bgcolor: 'white',
                                    color: colors.primary,
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {currentContent.registerStudent}
                            </Button>
                            <Button 
                                variant="outlined"
                                size="large"
                                component={Link} 
                                to="/teacher-application"
                                startIcon={<Person />}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    borderColor: 'white',
                                    color: 'white',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                {currentContent.teacherApplication}
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </CTASection>

            {/* Footer */}
            <Footer themeMode={themeMode} colors={colors}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <School sx={{ mr: 2, fontSize: 28 }} />
                            <Typography variant="h5" sx={{ fontWeight: 300 }}>
                                {currentContent.schoolName}
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                            {currentContent.footerText}
                        </Typography>
                    </Box>
                </Container>
            </Footer>
        </PageContainer>
    );
};

export default Homepage;

// Animations
const falling = keyframes`
    to {
        transform: translateY(100vh) rotate(360deg);
    }
`;

// Styled Components
const PageContainer = styled(Box)(({ themeMode, colors }) => ({
    minHeight: '100vh',
    background: themeMode === 'light' 
        ? `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`
        : `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
    overflow: 'hidden',
    position: 'relative'
}));

const StarsContainer = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1
});

const FallingStar = styled(Box)(({ themeMode }) => ({
    position: 'absolute',
    top: '-10vh',
    animation: `${falling} linear infinite`,
    color: themeMode === 'light' ? 'rgba(139, 21, 56, 0.4)' : 'rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none'
}));

const StyledAppBar = styled(AppBar)(({ themeMode, colors }) => ({
    background: themeMode === 'light'
        ? `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
        : `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${colors.divider}`,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
    zIndex: 1200
}));

const HeroSection = styled(Box)(({ themeMode, colors }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    paddingTop: '80px'
}));

const FeatureChip = styled(Chip)(({ themeMode, colors }) => ({
    borderRadius: 20,
    background: themeMode === 'light'
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(26, 26, 26, 0.9)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.divider}`,
    padding: '8px 4px',
    transition: 'all 0.3s ease',
    
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: themeMode === 'light'
            ? '0px 4px 12px rgba(139, 21, 56, 0.15)'
            : '0px 4px 12px rgba(0, 0, 0, 0.3)'
    },
    
    '& .MuiChip-icon': {
        color: colors.primary
    }
}));

const StatsCard = styled(Paper)(({ themeMode, colors }) => ({
    padding: '40px',
    borderRadius: 24,
    background: themeMode === 'light'
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(26, 26, 26, 0.9)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.divider}`,
    boxShadow: themeMode === 'light'
        ? '0px 16px 48px rgba(139, 21, 56, 0.08)'
        : '0px 16px 48px rgba(0, 0, 0, 0.4)',
    position: 'relative',
    zIndex: 2,
    transition: 'all 0.3s ease',
    
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: themeMode === 'light'
            ? '0px 20px 56px rgba(139, 21, 56, 0.12)'
            : '0px 20px 56px rgba(0, 0, 0, 0.5)'
    }
}));

const StatItem = styled(Box)({
    textAlign: 'center',
    padding: '16px'
});

const FeaturesSection = styled(Box)(({ themeMode, colors }) => ({
    padding: '120px 0',
    position: 'relative',
    zIndex: 2
}));

const FeatureCard = styled(Card)(({ themeMode, colors }) => ({
    height: '100%',
    borderRadius: 20,
    border: `1px solid ${colors.divider}`,
    background: themeMode === 'light'
        ? 'rgba(255, 255, 255, 0.8)'
        : 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(20px)',
    boxShadow: themeMode === 'light'
        ? '0px 8px 32px rgba(139, 21, 56, 0.06)'
        : '0px 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: themeMode === 'light'
            ? '0px 16px 48px rgba(139, 21, 56, 0.12)'
            : '0px 16px 48px rgba(0, 0, 0, 0.5)'
    }
}));

const CTASection = styled(Box)(({ themeMode, colors }) => ({
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    color: 'white',
    padding: '100px 0',
    position: 'relative',
    zIndex: 2
}));

const Footer = styled(Box)(({ themeMode, colors }) => ({
    background: themeMode === 'light'
        ? `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`
        : `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
    color: colors.text.primary,
    padding: '80px 0 40px',
    position: 'relative',
    zIndex: 2,
    borderTop: `1px solid ${colors.divider}`
}));
