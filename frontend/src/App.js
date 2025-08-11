import './App.css';
import { Routes, Route } from 'react-router-dom';
import CheckUser from './components/admin/auth/CheckUser';
import AdminSignup from './components/admin/auth/AdminSignup';
import AddClient from './components/admin/client/AddClient';


function App() {
  return (
    <>
      <Routes>
        <Route 
          path='/:role/login'
          element={<CheckUser />}
        ></Route>
        <Route 
          path='/:role/signup'
          element={<AdminSignup />}
        ></Route>

        <Route 
          path='/admin/add-client'
          element={<AddClient />}
          ></Route>
      </Routes>
    </>
  );
}

export default App;
