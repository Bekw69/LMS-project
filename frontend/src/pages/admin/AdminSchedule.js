import React from 'react';
import { Container } from '@mui/material';
import ScheduleManager from '../../components/ScheduleManager';
import { useSelector } from 'react-redux';

const AdminSchedule = () => {
    const { currentUser } = useSelector(state => state.user);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <ScheduleManager 
                userRole="admin"
                classId={null} // Можно передать конкретный класс
                editable={true}
            />
        </Container>
    );
};

export default AdminSchedule; 