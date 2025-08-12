import HomePage from './layout/HomePage';

export default function PublicRoute({ children }) {
    if(localStorage.getItem('token')) { 
        return <HomePage />
    } else {
        return children;
    }
}

