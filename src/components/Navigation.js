import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { usersApi } from '../services/api';
import { clearSession, getUser, getViewTenantId, hasSingleAssignedShop, isSuperAdmin, setViewTenantId } from '../services/session';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedShop, selectedStore, hideStoresNav } = useShop();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(getUser());
  const [tenants, setTenants] = useState([]);
  const [viewTenantId, setLocalTenantId] = useState(getViewTenantId() || '');

  useEffect(() => {
    const refreshUser = () => setUser(getUser());
    window.addEventListener('ims-session', refreshUser);
    window.addEventListener('storage', refreshUser);
    return () => {
      window.removeEventListener('ims-session', refreshUser);
      window.removeEventListener('storage', refreshUser);
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin(user)) {
      return;
    }
    usersApi.getTenants().then(setTenants).catch(() => setTenants([]));
  }, [user]);

  const menuItems = [
    { path: '/home', label: 'Dashboard' },
    { path: '/sales', label: 'Sales' },
    { path: '/items', label: 'Items' },
    { path: '/categories', label: 'Categories' },
    { path: '/companies', label: 'Companies' },
    { path: '/purchases', label: 'Purchases' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/shops', label: 'Shops', hide: hasSingleAssignedShop(user) },
    { path: '/stores', label: 'Stores', hide: hideStoresNav },
    // { path: '/orders', label: 'Orders' },
  ];

  if (isSuperAdmin(user)) {
    menuItems.splice(1, 0, { path: '/admin/users', label: 'Users' });
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate('/');
    closeMenu();
  };

  const handleTenantChange = (e) => {
    const value = e.target.value;
    setLocalTenantId(value);
    setViewTenantId(value || null);
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
          {menuItems.filter(item => !item.hide).map((item) => (
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
        </ul>
        <div className="nav-auth">
          {user ? (
            <>
              {selectedShop && (
                hasSingleAssignedShop(user) ? (
                  <span className="nav-shop-info">Shop: {selectedShop.name}</span>
                ) : (
                  <Link to="/shops" className="nav-shop-info" onClick={closeMenu}>
                    Shop: {selectedShop.name}
                  </Link>
                )
              )}
              {isSuperAdmin(user) && (
                <select
                  className="nav-tenant-select"
                  value={viewTenantId}
                  onChange={handleTenantChange}
                  title="Organization scope for create and list"
                >
                  <option value="">All organizations</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              )}
              <span className="nav-user-info" title={user.name || user.email}>
                {user.name || user.email}
              </span>
              <button className="nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-login-btn" onClick={() => { navigate('/'); closeMenu(); }}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
