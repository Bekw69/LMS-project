import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { SocketProvider } from './context/SocketContext';
import { ThemeContextProvider } from './context/ThemeContext';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import SecretAdminRegister from './pages/admin/SecretAdminRegister';
import TeacherApplicationForm from './pages/TeacherApplicationForm';
import StudentRegistrationForm from './pages/StudentRegistrationForm';

// Simple 404 component
const NotFound = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    fontFamily: 'Arial, sans-serif'
  }}>
    <h1 style={{ fontSize: '4rem', margin: '0', color: '#8b1538' }}>404</h1>
    <h2 style={{ margin: '10px 0', color: '#666' }}>Page Not Found</h2>
    <p style={{ color: '#999' }}>The page you're looking for doesn't exist.</p>
    <a href="/" style={{ 
      marginTop: '20px', 
      padding: '10px 20px', 
      backgroundColor: '#8b1538', 
      color: 'white', 
      textDecoration: 'none',
      borderRadius: '5px' 
    }}>
      Go Home
    </a>
  </div>
);

const PrivateRoute = ({ children, role, currentRole, currentUser }) => {
  if (!currentUser || !currentRole) {
    return <div>Loading...</div>;
  }
  
  // If user is logged in and their role matches required role, show component
  if (currentRole === role) {
    return children;
  }
  
  // Otherwise, redirect to home page
  return <Navigate to="/" />;
};

const App = () => {
  const { currentRole, currentUser } = useSelector(state => state.user);

  return (
    <ThemeContextProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Homepage />} />
            
            {/* Login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Teacher Application Form */}
            <Route path="/teacher-application" element={<TeacherApplicationForm />} />
            
            {/* Student Registration Form */}
            <Route path="/student-registration" element={<StudentRegistrationForm />} />
            
            {/* Admin Registration */}
            <Route path="/admin-register" element={<AdminRegisterPage />} />
            <Route path="/secret-admin-register" element={<SecretAdminRegister />} />

            {/* --- Protected Routes --- */}
            <Route
              path="/Admin/*"
              element={
                <PrivateRoute role="Admin" currentRole={currentRole} currentUser={currentUser}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/Student/*"
              element={
                <PrivateRoute role="Student" currentRole={currentRole} currentUser={currentUser}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/Teacher/*"
              element={
                <PrivateRoute role="Teacher" currentRole={currentRole} currentUser={currentUser}>
                  <TeacherDashboard />
                </PrivateRoute>
              }
            />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SocketProvider>
    </ThemeContextProvider>
  );
};

export default App;
