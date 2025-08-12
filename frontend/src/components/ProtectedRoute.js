import {useDispatch, useSelector} from 'react-redux';
import { ADMIN_END_POINT} from '../utils/constants';
import { setUser, clearUser } from '../redux/features/userSlice';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => {
        return state.user;
    });

    const getUser = async () => {
        try {
            const response = await fetch(`${ADMIN_END_POINT}/admin`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },

            });
            
            const data = await response.json();            
            if (response.ok) {
                dispatch(setUser(data.user));
            } else {
                localStorage.clear();
                // return <Navigate to="/admin/login" />;
            }
        } catch (error) {
            localStorage.clear();
            dispatch(clearUser());
        }
    }

    useEffect(() => {
        if(!user) {
            getUser()
        }
    }, [user]);

    if(localStorage.getItem('token')) {
        return children;
    } else {
        return <Navigate to='/admin/login' />
    }
}