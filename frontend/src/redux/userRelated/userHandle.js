import api from '../../config/api';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await api.post(`/${role}Login`, fields);

        if (result.data.success) {
            const token = result.data.data.token;
            const userDetails = result.data.data[role.toLowerCase()];

            localStorage.setItem('token', token);
            dispatch(authSuccess(userDetails));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch(authError(errorMessage));
    }
};

// ======================================================
//             GET USER DETAILS
// ======================================================
export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.get(`/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

// ======================================================
//             ADD STUFF
// ======================================================
export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await api.post(`/${address}Create`, fields);

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch(authError(errorMessage));
    }
};

// ======================================================
//                      ОСТАЛЬНЫЕ ФУНКЦИИ
// ======================================================

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await api.post(`/${role}Reg`, fields);
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else if (result.data.school) {
            dispatch(stuffAdded(result.data));
        }
        else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch(authError(errorMessage));
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    // Временно отключено согласно требованиям
    dispatch(getFailed("Sorry the delete function has been disabled for now."));
}

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.put(`/${address}/${id}`, fields);
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}