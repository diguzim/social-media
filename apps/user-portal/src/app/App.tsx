import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { Profile } from '../pages/Profile';
import { AuthenticatedLayout } from '../components/AuthenticatedLayout';
import { isAuthenticated } from '../utils';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes with navbar */}
        <Route
          element={isAuthenticated() ? <AuthenticatedLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
