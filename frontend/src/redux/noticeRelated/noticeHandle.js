import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './noticeSlice';

// Базовый URL API
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

export const getAllNotices = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/${address}List/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}