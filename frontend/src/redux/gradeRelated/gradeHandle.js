import axios from 'axios';
import { 
    getRequest, 
    getSuccess, 
    getFailed, 
    getError, 
    analyticsSuccess 
} from './gradeSlice';

// Базовый URL API
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

export const fetchGrades = (params = {}) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const query = new URLSearchParams(params).toString();
        const { data } = await axios.get(`${BASE_URL}/grades?${query}`);
        if (Array.isArray(data)) {
            dispatch(getSuccess(data));
        } else {
            dispatch(getFailed(data.message || 'Нет данных'));
        }
    } catch (err) {
        dispatch(getError(err.message));
    }
};

export const createGrade = (gradeData) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const { data } = await axios.post(`${BASE_URL}/grade`, gradeData);
        // Перезагружаем список после создания
        dispatch(fetchGrades({ classId: gradeData.class, subjectId: gradeData.subject }));
    } catch (err) {
        dispatch(getError(err.message));
    }
};

export const updateGrade = (id, gradeData) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.put(`${BASE_URL}/grade/${id}`, gradeData);
        dispatch(fetchGrades({ classId: gradeData.class, subjectId: gradeData.subject }));
    } catch (err) {
        dispatch(getError(err.message));
    }
};

export const deleteGrade = (id, refreshParams) => async (dispatch) => {
    dispatch(getRequest());
    try {
        await axios.delete(`${BASE_URL}/grade/${id}`);
        dispatch(fetchGrades(refreshParams));
    } catch (err) {
        dispatch(getError(err.message));
    }
};

export const fetchAnalytics = (params) => async (dispatch) => {
    try {
        const query = new URLSearchParams(params).toString();
        const { data } = await axios.get(`${BASE_URL}/grades/analytics?${query}`);
        dispatch(analyticsSuccess(data));
    } catch (err) {
        console.error('ANALYTICS ERROR', err);
    }
}; 