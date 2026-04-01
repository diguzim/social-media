import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Register } from '../pages/Register';
import { Login } from '../pages/Login';
import { UserProfile } from '../pages/UserProfile';
import { AccountSettingsLayout } from '../pages/account/AccountSettingsLayout';
import { AccountPersonalDataPage } from '../pages/account/AccountPersonalDataPage';
import { AccountPrivacyPage } from '../pages/account/AccountPrivacyPage';
import { AccountSecurityPage } from '../pages/account/AccountSecurityPage';
import { AccountNotificationsPage } from '../pages/account/AccountNotificationsPage';
import { AccountConfigurationsPage } from '../pages/account/AccountConfigurationsPage';
import { AccountHelpSupportPage } from '../pages/account/AccountHelpSupportPage';
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
            <Route path="/account" element={<AccountSettingsLayout />}>
              <Route index element={<Navigate to="personal-data" replace />} />
              <Route path="personal-data" element={<AccountPersonalDataPage />} />
              <Route path="privacy" element={<AccountPrivacyPage />} />
              <Route path="security" element={<AccountSecurityPage />} />
              <Route path="notifications" element={<AccountNotificationsPage />} />
              <Route path="configurations" element={<AccountConfigurationsPage />} />
              <Route path="help-support" element={<AccountHelpSupportPage />} />
            </Route>
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
