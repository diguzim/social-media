import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AuthenticatedLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
