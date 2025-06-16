import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import { Paper, Typography } from '@mui/material';
import TableViewTemplate from './TableViewTemplate';

const SeeNotice = () => {
    const dispatch = useDispatch();
    const { currentUser, currentRole } = useSelector(state => state.user);
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);

    useEffect(() => {
        // Выполняем dispatch только если currentUser существует.
        if (currentUser) {
            if (currentRole === "Admin") {
                dispatch(getAllNotices(currentUser._id, "Notice"));
            } else {
                // Также проверяем, что currentUser.school существует
                if (currentUser.school?._id) {
                    dispatch(getAllNotices(currentUser.school._id, "Notice"));
                }
            }
        }
        // Добавляем все внешние зависимости в массив.
    }, [dispatch, currentUser, currentRole]);

    if (error) {
        console.log(error);
    }

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: 170 },
        { id: 'details', label: 'Details', minWidth: 100 },
        { id: 'date', label: 'Date', minWidth: 170 },
    ];

    const noticeRows = noticesList && noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
        };
    });

    return (
        <div style={{ marginTop: '50px', marginRight: '20px' }}>
            {loading ? (
                <Typography variant="h6">Загрузка...</Typography>
            ) : response ? (
                <Typography variant="h6">Объявлений пока нет.</Typography>
            ) : (
                <>
                    <Typography variant="h5" sx={{ marginBottom: '20px' }}>Объявления</Typography>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        {Array.isArray(noticesList) && noticesList.length > 0 &&
                            <TableViewTemplate columns={noticeColumns} rows={noticeRows} />
                        }
                    </Paper>
                </>
            )}
        </div>
    );
};

export default SeeNotice;
