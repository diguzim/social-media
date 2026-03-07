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
      style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Link
        data-testid="navbar-home-link"
        to="/"
        style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        Home
      </Link>

      <h1 data-testid="navbar-title" style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
        Social Media
      </h1>

      <div data-testid="navbar-menu-container" style={{ position: 'relative' }}>
        <button
          data-testid="navbar-menu-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Menu ▼
        </button>

        {isDropdownOpen && (
          <div
            data-testid="navbar-menu-dropdown"
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: '4px',
              minWidth: '160px',
              zIndex: 1000,
            }}
          >
            <Link
              data-testid="navbar-profile-link"
              to="/profile"
              onClick={() => setIsDropdownOpen(false)}
              style={{
                display: 'block',
                padding: '12px 16px',
                color: '#333',
                textDecoration: 'none',
                borderBottom: '1px solid #eee',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              Profile
            </Link>
            <button
              data-testid="navbar-logout-button"
              onClick={() => {
                setIsDropdownOpen(false);
                handleLogout();
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                color: '#dc3545',
                textDecoration: 'none',
                border: 'none',
                backgroundColor: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: '0 0 4px 4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
