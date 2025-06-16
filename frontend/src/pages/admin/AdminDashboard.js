import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer } from '../../components/styles';
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';
import AdminSecretKey from './AdminSecretKey';
import AdminSchedule from './AdminSchedule';
import ChatMain from '../../components/Chat/ChatMain';
import CreateClassChat from '../../components/Chat/CreateClassChat';
import Settings from '../Settings';

import AddStudent from './studentRelated/AddStudent';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';

import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';
import TeacherApplications from './teacherRelated/TeacherApplications';
import StudentRegistrations from './studentRelated/StudentRegistrations';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';
import PerformanceAnalytics from './PerformanceAnalytics';

const AdminDashboard = () => {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            Admin Dashboard
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <SideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path="/dashboard" element={<AdminHomePage />} />
                        <Route path="/profile" element={<AdminProfile />} />
                        <Route path="/secret-key" element={<AdminSecretKey />} />
                        <Route path="/schedule" element={<AdminSchedule />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/chat" element={<ChatMain />} />
                        <Route path="/create-chats" element={<CreateClassChat />} />
                        <Route path="/complains" element={<SeeComplains />} />

                        {/* Notice */}
                        <Route path="/addnotice" element={<AddNotice />} />
                        <Route path="/notices" element={<ShowNotices />} />

                        {/* Subject */}
                        <Route path="/subjects" element={<ShowSubjects />} />
                        <Route path="/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />

                        <Route path="/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/class/subject/:classID/:subjectID" element={<ViewSubject />} />

                        <Route path="/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class */}
                        <Route path="/addclass" element={<AddClass />} />
                        <Route path="/classes" element={<ShowClasses />} />
                        <Route path="/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                        {/* Student */}
                        <Route path="/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/students" element={<ShowStudents />} />
                        <Route path="/students/student/:id" element={<ViewStudent />} />
                        <Route path="/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                        {/* Teacher */}
                        <Route path="/teachers" element={<ShowTeachers />} />
                        <Route path="/teacher-applications" element={<TeacherApplications />} />
                        <Route path="/student-registrations" element={<StudentRegistrations />} />
                        <Route path="/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/teachers/addteacher/:id" element={<AddTeacher />} />

                        {/* Analytics */}
                        <Route path="/analytics" element={<PerformanceAnalytics />} />

                        {/* Wildcard route должен быть последним */}
                        <Route path='*' element={<Navigate to="/Admin/dashboard" />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default AdminDashboard

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    hideDrawer: {
        display: 'flex',
        '@media (max-width: 600px)': {
            display: 'none',
        },
    },
}