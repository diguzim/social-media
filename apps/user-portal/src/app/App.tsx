import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { UserProfile } from '../pages/UserProfile';
import { MyPosts } from '../pages/MyPosts';
import { Friends } from '../pages/Friends';
import { VerifyEmail } from '../pages/VerifyEmail';
import { NotFound } from '../pages/NotFound';
import { AuthenticatedLayout } from '../components/AuthenticatedLayout';
import { isAuthenticated } from '../utils';
import { AppStateContractsProvider } from '../state-contracts/providers/AppStateContractsProvider';

function ProtectedRoutes() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <AuthenticatedLayout />;
}

export function App() {
  return (
    <AppStateContractsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected routes with navbar */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/users/:username" element={<UserProfile />} />
            <Route path="/users/:username/:section" element={<UserProfile />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/friends" element={<Friends />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppStateContractsProvider>
  );
}
