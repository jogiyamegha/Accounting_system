
import { createSlice } from "@reduxjs/toolkit";
 
const initialState = {
    user: null,       
    role: null,     
    userType: null,  
    loading: false,   
    error: null,      
};
 
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { user, token = null, userType = null, role = null } = action.payload;
            state.user = user;
            state.userType = userType || role; // keep both consistent
            state.role = role;                 // always "admin" or "client"

            state.loading = false;

            state.error = null;

        },
    
        // ✅ Clear auth state (on logout or expired session)

        clearUser: (state) => {

        state.user = null;

        state.userType = null;

        state.role = null;

        state.loading = false;

        state.error = null;

        },
    
        // ✅ Set global loading state

        setLoading: (state, action) => {

        state.loading = action.payload;

        },
    
        // ✅ Set auth error (login failure, etc.)

        setError: (state, action) => {

        state.error = action.payload;

        state.loading = false;

        },

    },

});
 
export const { setUser, clearUser, setLoading, setError } = userSlice.actions;

export default userSlice.reducer;

 