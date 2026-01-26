import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (err) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const menuItems = [
    { path: '/shops', label: 'Shops' },
    { path: '/stores', label: 'Stores' },
    { path: '/companies', label: 'Companies' },
    { path: '/items', label: 'Items' },
    { path: '/orders', label: 'Orders' },
    { path: '/purchases', label: 'Purchases' },
    { path: '/sales', label: 'Sales' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/categories', label: 'Categories' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    closeMenu();
  };

  const handleLogin = () => {
    navigate('/');
    closeMenu();
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <h2 className="nav-logo">IMS</h2>
        <button 
          className="nav-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={isMenuOpen ? 'hamburger open' : 'hamburger'}></span>
          <span className={isMenuOpen ? 'hamburger open' : 'hamburger'}></span>
          <span className={isMenuOpen ? 'hamburger open' : 'hamburger'}></span>
        </button>
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname.startsWith(item.path) ? 'active' : ''}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="nav-auth">
            {user ? (
              <>
                <span className="nav-user-info">{user.name || user.email}</span>
                <button className="nav-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="nav-login-btn" onClick={handleLogin}>
                Login
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;

