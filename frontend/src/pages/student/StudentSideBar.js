import React, { useMemo } from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChatIcon from '@mui/icons-material/Chat';
import GradeIcon from '@mui/icons-material/Grade';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import TaskIcon from '@mui/icons-material/Task';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';

const StudentSideBar = React.memo(() => {
    const location = useLocation();
    
    // Мемоизируем конфигурацию меню для лучшей производительности
    const menuItems = useMemo(() => [
        {
            text: 'Главная',
            icon: HomeIcon,
            path: '/Student/dashboard',
            isActive: location.pathname === '/' || location.pathname === '/Student/dashboard'
        },
        {
            text: 'Предметы',
            icon: AssignmentIcon,
            path: '/Student/subjects',
            isActive: location.pathname.startsWith('/Student/subjects')
        },
        {
            text: 'Задания',
            icon: TaskIcon,
            path: '/Student/assignments',
            isActive: location.pathname.startsWith('/Student/assignments')
        },
        {
            text: 'Библиотека',
            icon: LibraryBooksIcon,
            path: '/Student/library',
            isActive: location.pathname.startsWith('/Student/library')
        },
        {
            text: 'Регистрация в группы',
            icon: GroupIcon,
            path: '/Student/group-registration',
            isActive: location.pathname.startsWith('/Student/group-registration')
        },
        {
            text: 'Посещаемость',
            icon: ClassOutlinedIcon,
            path: '/Student/attendance',
            isActive: location.pathname.startsWith('/Student/attendance')
        },
        {
            text: 'Жалобы',
            icon: AnnouncementOutlinedIcon,
            path: '/Student/complain',
            isActive: location.pathname.startsWith('/Student/complain')
        },
        {
            text: 'Чаты',
            icon: ChatIcon,
            path: '/Student/chat',
            isActive: location.pathname.startsWith('/Student/chat')
        },
        {
            text: 'Оценки',
            icon: GradeIcon,
            path: '/Student/grades',
            isActive: location.pathname.startsWith('/Student/grades')
        }
    ], [location.pathname]);

    const userMenuItems = useMemo(() => [
        {
            text: 'Профиль',
            icon: AccountCircleOutlinedIcon,
            path: '/Student/profile',
            isActive: location.pathname.startsWith('/Student/profile')
        },
        {
            text: 'Настройки',
            icon: SettingsIcon,
            path: '/Student/settings',
            isActive: location.pathname.startsWith('/Student/settings')
        },
        {
            text: 'Выход',
            icon: ExitToAppIcon,
            path: '/logout',
            isActive: location.pathname.startsWith('/logout')
        }
    ], [location.pathname]);

    return (
        <>
            <React.Fragment>
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <ListItemButton 
                            key={item.path}
                            component={Link} 
                            to={item.path}
                            sx={{
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    transform: 'translateX(4px)'
                                },
                                ...(item.isActive && {
                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                    borderRight: '3px solid #1976d2'
                                })
                            }}
                        >
                            <ListItemIcon>
                                <IconComponent color={item.isActive ? 'primary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        fontWeight: item.isActive ? 600 : 400,
                                        color: item.isActive ? 'primary.main' : 'inherit'
                                    }
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </React.Fragment>
            
            <Divider sx={{ my: 1 }} />
            
            <React.Fragment>
                <ListSubheader component="div" inset>
                    Пользователь
                </ListSubheader>
                {userMenuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <ListItemButton 
                            key={item.path}
                            component={Link} 
                            to={item.path}
                            sx={{
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    transform: 'translateX(4px)'
                                },
                                ...(item.isActive && {
                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                    borderRight: '3px solid #1976d2'
                                })
                            }}
                        >
                            <ListItemIcon>
                                <IconComponent color={item.isActive ? 'primary' : 'inherit'} />
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        fontWeight: item.isActive ? 600 : 400,
                                        color: item.isActive ? 'primary.main' : 'inherit'
                                    }
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </React.Fragment>
        </>
    );
});

StudentSideBar.displayName = 'StudentSideBar';

export default StudentSideBar;