import React, { useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../../redux/gradeRelated/gradeHandle';

const PerformanceAnalytics = () => {
    const dispatch = useDispatch();
    const { analytics } = useSelector(state => state.grade);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(fetchAnalytics({ type: 'classAverage', classId: '', subjectId: '', quarter: 1, year: '' }));
    }, [dispatch]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Аналитика успеваемости (beta)
            </Typography>
            <Box>
                {/* Здесь будут графики (Recharts/Chart.js) */}
                <pre>{JSON.stringify(analytics, null, 2)}</pre>
            </Box>
        </Container>
    );
};

export default PerformanceAnalytics; 