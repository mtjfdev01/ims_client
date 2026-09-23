import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import PermissionsModal, { PermissionsIconButton } from '../../components/PermissionsModal';
import { shopsApi, usersApi } from '../../services/api';
import '../../components/SingleView.css';
import './AdminUsers.css';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'user',
    shopIds: [],
    password: '',
  });
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await usersApi.getOne(id);
        setUser(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'user',
          shopIds: (data.shops || []).map((shop) => shop.id),
          password: '',
        });
        if (data.tenant?.id) {
          setShopsLoading(true);
          const shopRows = await shopsApi.getAll(undefined, undefined, { tenantId: data.tenant.id });
          setShops(Array.isArray(shopRows) ? shopRows : (shopRows.data || []));
        }
      } catch (err) {
        setError(err.message || 'Failed to load user');
      } finally {
        setShopsLoading(false);
        setLoadingData(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleShop = (shopId) => {
    setForm((prev) => ({
      ...prev,
      shopIds: prev.shopIds.includes(shopId)
        ? prev.shopIds.filter((value) => value !== shopId)
        : [...prev.shopIds, shopId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        shopIds: form.shopIds,
      };
      if (form.password) {
        body.password = form.password;
      }
      await usersApi.update(id, body);
      navigate(`/admin/users/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update user');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Navigation />
        <div className="form-wrapper-container"><p>Loading...</p></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Navigation />
        <div className="form-wrapper-container">
          <p>{error || 'User not found'}</p>
          <button type="button" className="admin-primary-btn" onClick={() => navigate('/admin/users')}>
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <FormWrapper title={`Edit ${user.name}`} onSubmit={handleSubmit}>
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}
        <div className="form-fields-row">
          <FormField label="Name" htmlFor="name" required>
            <Input id="name" name="name" type="text" value={form.name} onChange={handleChange} required />
          </FormField>
          <FormField label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </FormField>
          <FormField label="Role" htmlFor="role" required>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="user">Shop user</option>
              <option value="tenant_admin">Organization admin</option>
            </select>
          </FormField>
          <FormField label="New password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              placeholder="Leave blank to keep current"
            />
          </FormField>
        </div>
        <FormField label="Organization">
          <input type="text" value={user.tenant?.name || '—'} disabled />
        </FormField>
        <FormField label="Shops" htmlFor="shopIds">
          <div className="admin-checkbox-list">
            {shopsLoading && <span>Loading shops...</span>}
            {!shopsLoading && shops.length === 0 && <span>No shops in this organization yet.</span>}
            {shops.map((shop) => (
              <label key={shop.id}>
                <input
                  type="checkbox"
                  checked={form.shopIds.includes(shop.id)}
                  onChange={() => toggleShop(shop.id)}
                />
                {shop.name}
              </label>
            ))}
          </div>
        </FormField>
        <FormField label="Permissions">
          <PermissionsIconButton
            onClick={() => {
              setError('');
              setSuccess('');
              setPermissionsOpen(true);
            }}
          />
        </FormField>
        <div className="form-actions">
          <button type="button" className="single-view-button" onClick={() => navigate(`/admin/users/${id}`)}>
            Cancel
          </button>
          <button type="submit" className="admin-primary-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </FormWrapper>
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

export default UserEdit;
