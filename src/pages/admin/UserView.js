import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { EyeIcon } from '../../components/Input';
import PermissionsModal, { PermissionsIconButton } from '../../components/PermissionsModal';
import { usersApi } from '../../services/api';
import { roleLabel } from './userLabels';
import '../../components/SingleView.css';
import './AdminUsers.css';

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setUser(await usersApi.getOne(id));
    } catch (err) {
      setError(err.message || 'Failed to load user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, [id]);

  const handleReveal = async () => {
    if (showPassword) {
      setShowPassword(false);
      return;
    }
    try {
      const result = await usersApi.revealPassword(id);
      setPassword(result.password || 'No stored password');
      setShowPassword(true);
    } catch (err) {
      setError(err.message || 'Failed to reveal password');
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Archive this user? They will no longer be able to log in.')) {
      return;
    }
    try {
      await usersApi.archive(id);
      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'Failed to archive user');
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="user-view-page"><p>Loading...</p></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Navigation />
        <div className="user-view-page">
          <p>{error || 'User not found'}</p>
          <button type="button" onClick={() => navigate('/admin/users')} className="single-view-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const shops = user.shops || [];

  return (
    <div>
      <Navigation />
      <div className="user-view-page">
        <div className="user-view-header">
          <div>
            <h1>{user.name}</h1>
            <p className="user-view-subtitle">{user.email}</p>
          </div>
          <div className="single-view-actions">
            <button type="button" onClick={() => navigate('/admin/users')} className="single-view-button">
              Back
            </button>
            <button type="button" onClick={() => navigate(`/admin/users/${id}/edit`)} className="single-view-button single-view-button-primary">
              Edit
            </button>
            <button type="button" onClick={handleArchive} className="single-view-button single-view-button-danger">
              Archive
            </button>
          </div>
        </div>
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}
        <div className="user-view-card">
          <div className="user-view-grid">
            <div className="user-view-item">
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="user-view-item">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className="user-view-item">
              <span>Role</span>
              <strong>{roleLabel(user.role)}</strong>
            </div>
            <div className="user-view-item">
              <span>Organization</span>
              <strong>{user.tenant?.name || '—'}</strong>
            </div>
            <div className="user-view-item">
              <span>Password</span>
              <div className="admin-password-cell">
                <strong>{showPassword ? password : '••••••'}</strong>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={handleReveal}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>
            <div className="user-view-item">
              <span>Permissions</span>
              <PermissionsIconButton
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setPermissionsOpen(true);
                }}
              />
            </div>
            <div className="user-view-item user-view-item-wide">
              <span>Shops</span>
              {shops.length ? (
                <div className="user-view-shops">
                  {shops.map((shop) => (
                    <span key={shop.id} className="user-view-shop">{shop.name}</span>
                  ))}
                </div>
              ) : (
                <strong>—</strong>
              )}
            </div>
          </div>
        </div>
      </div>
      {permissionsOpen && (
        <PermissionsModal
          user={user}
          onClose={() => setPermissionsOpen(false)}
          onSaved={(updated) => {
            setSuccess(`Saved access for ${updated.name}`);
            setUser((prev) => (prev ? { ...prev, permissions: updated.permissions } : prev));
          }}
        />
      )}
    </div>
  );
};

export default UserView;
