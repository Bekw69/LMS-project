import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    gradesList: [],      // все оценки (используется в журналах)
    loading: false,
    error: null,
    response: null,
    analytics: null      // данные аналитики (средние баллы и т.д.)
};

const gradeSlice = createSlice({
    name: 'grade',
    initialState,
    reducers: {
        getRequest: state => { state.loading = true; },
        getSuccess: (state, action) => {
            state.gradesList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
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
        analyticsSuccess: (state, action) => {
            state.analytics = action.payload;
        }
    }
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    analyticsSuccess
} = gradeSlice.actions;

export const gradeReducer = gradeSlice.reducer; 