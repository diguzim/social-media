import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { UnverifiedEmailBanner } from './UnverifiedEmailBanner';
import { getUserProfile } from '../services/auth';

export function AuthenticatedLayout() {
  const profile = getUserProfile();
  const isEmailVerified = profile?.emailVerifiedAt != null;

  return (
    <>
      <Navbar />
      {!isEmailVerified && <UnverifiedEmailBanner />}
      <Outlet />
    </>
  );
}
