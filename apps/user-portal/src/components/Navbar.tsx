import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { clearAuth } from '../utils/auth';

export function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <nav
      data-testid="navbar"
      className="flex items-center justify-between bg-primary-600 px-4 py-3 text-white shadow-card sm:px-6"
    >
      <div className="flex items-center gap-4">
        <Link
          data-testid="navbar-home-link"
          to="/"
          className="text-lg font-semibold text-white no-underline transition hover:text-primary-100"
        >
          Home
        </Link>
        <Link
          data-testid="navbar-my-posts-link"
          to="/my-posts"
          className="text-lg font-semibold text-white no-underline transition hover:text-primary-100"
        >
          My Posts
        </Link>
        <Link
          data-testid="navbar-friends-link"
          to="/friends"
          className="text-lg font-semibold text-white no-underline transition hover:text-primary-100"
        >
          Friends
        </Link>
      </div>

      <h1 data-testid="navbar-title" className="text-xl font-bold sm:text-2xl">
        Social Media
      </h1>

      <div data-testid="navbar-menu-container" className="relative">
        <button
          data-testid="navbar-menu-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/80"
        >
          Menu ▼
        </button>

        {isDropdownOpen && (
          <div
            data-testid="navbar-menu-dropdown"
            className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
          >
            <Link
              data-testid="navbar-profile-link"
              to="/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="block border-b border-slate-200 px-4 py-3 text-sm text-slate-700 no-underline transition hover:bg-slate-100"
            >
              Profile
            </Link>
            <button
              data-testid="navbar-logout-button"
              onClick={() => {
                setIsDropdownOpen(false);
                handleLogout();
              }}
              className="block w-full rounded-b-md px-4 py-3 text-left text-sm text-danger-600 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
