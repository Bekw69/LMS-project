import React from 'react';
import { Container } from '@mui/material';
import AssignmentManager from '../../components/AssignmentManager';
import { useSelector } from 'react-redux';

const TeacherAssignments = () => {
    const { currentUser } = useSelector(state => state.user);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <AssignmentManager 
                userRole="teacher"
                teacherId={currentUser?._id}
                classId={currentUser?.teachSclass?._id}
            />
        </Container>
    );
};

export default TeacherAssignments; 