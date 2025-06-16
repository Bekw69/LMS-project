import { createSlice } from '@reduxjs/toolkit';

// Функция для безопасного получения пользователя из localStorage
const getUserFromStorage = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error parsing user from localStorage", error);
        return null;
    }
};

const currentUserFromStorage = getUserFromStorage();

const initialState = {
    status: 'idle',
    userDetails: [],
    tempDetails: [],
    loading: false,
    currentUser: currentUserFromStorage,
    currentRole: currentUserFromStorage ? currentUserFromStorage.role : null,
    error: null,
    response: null,
    darkMode: true
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        authRequest: (state) => {
            state.status = 'loading';
            state.error = null; // Сбрасываем ошибку при новом запросе
        },
        underControl: (state) => {
            state.status = 'idle';
            state.response = null;
        },
        stuffAdded: (state, action) => {
            state.status = 'added';
            state.response = null;
            state.error = null;
            state.tempDetails = action.payload;
        },
        // ======================================================
        //             AUTH SUCCESS (ИСПРАВЛЕННАЯ ВЕРСИЯ)
        // ======================================================
        authSuccess: (state, action) => {
            state.status = 'success';
            // action.payload - это чистый объект пользователя (admin, student, etc.)
            state.currentUser = action.payload;
            state.currentRole = action.payload.role;
            // Сохраняем пользователя в localStorage для восстановления сессии
            localStorage.setItem('user', JSON.stringify(action.payload));
            state.response = null;
            state.error = null;
        },
        authFailed: (state, action) => {
            state.status = 'failed';
            state.response = action.payload; // Сообщение об ошибке, напр. "Неверный пароль"
            state.error = null;
        },
        authError: (state, action) => {
            state.status = 'error';
            state.error = action.payload; // Ошибка сети или сервера
            state.response = null;
        },
        // ======================================================
        //             AUTH LOGOUT (ИСПРАВЛЕННАЯ ВЕРСИЯ)
        // ======================================================
        authLogout: (state) => {
            // Полностью очищаем все данные сессии
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            state.currentUser = null;
            state.status = 'idle';
            state.error = null;
            state.currentRole = null;
        },
        doneSuccess: (state, action) => {
            state.userDetails = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getDeleteSuccess: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getRequest: (state) => {
            state.loading = true;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        }
    },
});

export const {
    authRequest,
    underControl,
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
    toggleDarkMode
} = userSlice.actions;

export const userReducer = userSlice.reducer;