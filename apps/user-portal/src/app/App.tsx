import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { Profile } from '../pages/Profile';
import { MyPosts } from '../pages/MyPosts';
import { VerifyEmail } from '../pages/VerifyEmail';
import { NotFound } from '../pages/NotFound';
import { AuthenticatedLayout } from '../components/AuthenticatedLayout';
import { isAuthenticated } from '../utils';

function ProtectedRoutes() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <AuthenticatedLayout />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected routes with navbar */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-posts" element={<MyPosts />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
