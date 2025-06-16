import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { noticeReducer } from './noticeRelated/noticeSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import { teacherReducer } from './teacherRelated/teacherSlice';
import { complainReducer } from './complainRelated/complainSlice';
import { gradeReducer } from './gradeRelated/gradeSlice';
import axios from 'axios';

// Настройка базового URL для axios
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        teacher: teacherReducer,
        notice: noticeReducer,
        sclass: sclassReducer,
        complain: complainReducer,
        grade: gradeReducer,
    },
});

export default store;
