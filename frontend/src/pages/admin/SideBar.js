import * as React from 'react';
import { 
    Divider, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    ListSubheader,
    Box,
    Typography,
    Chip
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import KeyIcon from '@mui/icons-material/Key';
import ChatIcon from '@mui/icons-material/Chat';
import AddCommentIcon from '@mui/icons-material/AddComment';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BarChartIcon from '@mui/icons-material/BarChart';

const SideBar = () => {
    const location = useLocation();
    const { currentUser } = useSelector((state) => state.user);

    const menuItems = [
        {
            text: "Главная",
            icon: HomeIcon,
            path: "/Admin/dashboard",
            active: location.pathname === "/" || location.pathname === "/Admin/dashboard"
        },
        {
            text: "Классы",
            icon: ClassOutlinedIcon,
            path: "/Admin/classes",
            active: location.pathname.startsWith('/Admin/classes')
        },
        {
            text: "Предметы",
            icon: AssignmentIcon,
            path: "/Admin/subjects",
            active: location.pathname.startsWith("/Admin/subjects")
        },
        {
            text: "Расписание",
            icon: ScheduleIcon,
            path: "/Admin/schedule",
            active: location.pathname.startsWith("/Admin/schedule")
        },
        {
            text: "Учителя",
            icon: SupervisorAccountOutlinedIcon,
            path: "/Admin/teachers",
            active: location.pathname.startsWith("/Admin/teachers")
        },
        {
            text: "Заявки учителей",
            icon: AssignmentIndIcon,
            path: "/Admin/teacher-applications",
            active: location.pathname.startsWith("/Admin/teacher-applications")
        },
        {
            text: "Регистрации студентов",
            icon: PersonAddIcon,
            path: "/Admin/student-registrations",
            active: location.pathname.startsWith("/Admin/student-registrations")
        },
        {
            text: "Студенты",
            icon: PersonOutlineIcon,
            path: "/Admin/students",
            active: location.pathname.startsWith("/Admin/students")
        },
        {
            text: "Объявления",
            icon: AnnouncementOutlinedIcon,
            path: "/Admin/notices",
            active: location.pathname.startsWith("/Admin/notices")
        },
        {
            text: "Жалобы",
            icon: ReportIcon,
            path: "/Admin/complains",
            active: location.pathname.startsWith("/Admin/complains")
        },
        {
            text: "Чаты",
            icon: ChatIcon,
            path: "/Admin/chat",
            active: location.pathname.startsWith("/Admin/chat")
        },
        {
            text: "Создать чаты",
            icon: AddCommentIcon,
            path: "/Admin/create-chats",
            active: location.pathname.startsWith("/Admin/create-chats")
        },
        {
            text: "Аналитика",
            icon: BarChartIcon,
            path: "/Admin/analytics",
            active: location.pathname.startsWith("/Admin/analytics")
        },
    ];

    const userMenuItems = [
        {
            text: "Профиль",
            icon: AccountCircleOutlinedIcon,
            path: "/Admin/profile",
            active: location.pathname.startsWith("/Admin/profile")
        },
        {
            text: "Настройки",
            icon: SettingsIcon,
            path: "/Admin/settings",
            active: location.pathname.startsWith("/Admin/settings")
        }
    ];

    const renderMenuItem = (item, index) => (
        <ListItemButton
            key={index}
            component={Link}
            to={item.path}
            sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                minHeight: 48,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    transform: 'translateX(4px)',
                },
                ...(item.active && {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                        color: 'white',
                    }
                })
            }}
        >
            <ListItemIcon
                sx={{
                    minWidth: 40,
                    color: item.active ? 'white' : 'text.secondary',
                    transition: 'color 0.2s ease-in-out'
                }}
            >
                <item.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: item.active ? 600 : 500,
                }}
            />
        </ListItemButton>
    );

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                    Школа
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Панель управления
                </Typography>
            </Box>

            {/* Main Menu */}
            <Box sx={{ px: 1, flex: 1 }}>
                <Typography 
                    variant="overline" 
                    sx={{ 
                        px: 2, 
                        py: 1, 
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                        letterSpacing: 1
                    }}
                >
                    Основное
                </Typography>
                
                {menuItems.map((item, index) => renderMenuItem(item, index))}

                <Divider sx={{ my: 2, mx: 2 }} />

                <Typography 
                    variant="overline" 
                    sx={{ 
                        px: 2, 
                        py: 1, 
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                        letterSpacing: 1
                    }}
                >
                    Пользователь
                </Typography>

                {userMenuItems.map((item, index) => renderMenuItem(item, index))}

                {/* Показываем пункт "Секретный ключ" только для SuperAdmin */}
                {currentUser?.adminLevel === 'SuperAdmin' && (
                    <ListItemButton
                        component={Link}
                        to="/Admin/secret-key"
                        sx={{
                            mx: 1,
                            mb: 0.5,
                            borderRadius: 2,
                            minHeight: 48,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                transform: 'translateX(4px)',
                            },
                            ...(location.pathname.startsWith("/Admin/secret-key") && {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                                '& .MuiListItemIcon-root': {
                                    color: 'white',
                                }
                            })
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 40,
                                color: location.pathname.startsWith("/Admin/secret-key") ? 'white' : 'text.secondary',
                                transition: 'color 0.2s ease-in-out'
                            }}
                        >
                            <KeyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Секретный ключ"
                            primaryTypographyProps={{
                                fontSize: '0.875rem',
                                fontWeight: location.pathname.startsWith("/Admin/secret-key") ? 600 : 500,
                            }}
                        />
                        <Chip 
                            label="SUPER" 
                            size="small" 
                            color="warning"
                            sx={{ 
                                height: 20, 
                                fontSize: '0.6rem',
                                fontWeight: 'bold'
                            }}
                        />
                    </ListItemButton>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ p: 1 }}>
                <ListItemButton
                    component={Link}
                    to="/logout"
                    sx={{
                        mx: 1,
                        borderRadius: 2,
                        minHeight: 48,
                        color: 'error.main',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'white',
                            transform: 'translateX(4px)',
                            '& .MuiListItemIcon-root': {
                                color: 'white',
                            }
                        }
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 40,
                            color: 'error.main',
                            transition: 'color 0.2s ease-in-out'
                        }}
                    >
                        <ExitToAppIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Выход"
                        primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                        }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );
};

export default SideBar;
