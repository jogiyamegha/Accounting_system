import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../redux/features/userSlice'; // adjust path if needed

const store = configureStore({
    reducer: {
        user: userReducer, // register your slice here
    },
});

export default store;
