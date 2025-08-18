// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//     user: null,
// };

// const userSlice = createSlice({
//     name: 'user',
//     initialState,
//     reducers: {
//             setUser(state, action) {
//                 state.user = action.payload;
//         },
//             clearUser(state) {
//             state.user = null;
//         },
//     },
// });

// export const { setUser, clearUser } = userSlice.actions;
// export default userSlice.reducer;

// redux/features/userSlice.js

import { createSlice } from "@reduxjs/toolkit";
 
const initialState = {
    user: null,       // Logged in user details
    token: null,      // Optional if you’re storing JWT in Redux
    userType: null,   // "admin" or "client"
    loading: false,   // Loader for auth requests
    role: null,
};
 
const userSlice = createSlice(
    {
        name: "user",
        initialState,
        reducers: {
            setUser: (state, action) => {
                state.user = action.payload.user;
                state.token = action.payload.token || null;
                state.userType = action.payload.userType || null;
                state.role = action.payload.role || null;
                state.loading = false;
            },
            clearUser: (state) => {
                state.user = null;
                state.token = null;
                state.userType = null;
                state.role = null;
                state.loading = false;
            },
            setLoading: (state, action) => {
            state.loading = action.payload;
            }
        }
    }
);
    
export const { setUser, clearUser, setLoading } = userSlice.actions;
export default userSlice.reducer;

    