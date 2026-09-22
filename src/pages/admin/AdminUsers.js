import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '../../components/Navigation';
import FormField from '../../components/FormField';
import Input, { EyeIcon } from '../../components/Input';
import PermissionsModal, { PermissionsIconButton } from '../../components/PermissionsModal';
import { shopsApi, usersApi } from '../../services/api';
import './AdminUsers.css';
import '../../components/Table.css';
import '../../components/Listing.css';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  orgMode: 'new',
  tenantId: '',
  tenantName: '',
  shopIds: [],
  role: 'user',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [revealed, setRevealed] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [assignShopIds, setAssignShopIds] = useState([]);
  const [resetId, setResetId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [permissionsUser, setPermissionsUser] = useState(null);

  const selectedTenantId = form.orgMode === 'existing' ? form.tenantId : '';

  const load = async () => {
    const [userRows, tenantRows] = await Promise.all([
      usersApi.getAll(),
      usersApi.getTenants(),
    ]);
    setUsers(userRows || []);
    setTenants(tenantRows || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message || 'Failed to load users'));
  }, []);

  useEffect(() => {
    const tenantId = assigningId
      ? users.find(user => user.id === assigningId)?.tenant?.id
      : selectedTenantId;
    if (!tenantId) {
      setShops([]);
      return;
    }
    shopsApi.getAll(undefined, undefined, { tenantId }).then((data) => {
      setShops(Array.isArray(data) ? data : (data.data || []));
    }).catch(() => setShops([]));
  }, [selectedTenantId, assigningId, users]);

  const regularUsers = useMemo(
    () => users.filter(user => user.role !== 'super_admin'),
    [users],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'orgMode' ? { shopIds: [] } : {}) }));
  };

  const toggleFormShop = (shopId) => {
    setForm(prev => ({
      ...prev,
      shopIds: prev.shopIds.includes(shopId)
        ? prev.shopIds.filter(id => id !== shopId)
        : [...prev.shopIds, shopId],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        name: form.name,
        email: form.email,
        password: form.password,
        shopIds: form.shopIds,
        role: form.role,
      };
      if (form.orgMode === 'existing' && form.tenantId) {
        body.tenantId = Number(form.tenantId);
      } else if (form.tenantName) {
        body.tenantName = form.tenantName;
      }
      await usersApi.create(body);
      setForm(emptyForm);
      setSuccess('User created');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async (userId) => {
    try {
      const result = await usersApi.revealPassword(userId);
      setRevealed(prev => ({ ...prev, [userId]: result.password || 'No stored password' }));
    } catch (err) {
      setError(err.message || 'Failed to reveal password');
    }
  };

  const handleReset = async (userId) => {
    if (!resetPassword || resetPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await usersApi.resetPassword(userId, resetPassword);
      setResetId(null);
      setResetPassword('');
      setSuccess('Password reset');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  };

  const handleAssign = async (userId) => {
    try {
      await usersApi.assignShops(userId, assignShopIds);
      setAssigningId(null);
      setSuccess('Shops assigned');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to assign shops');
    }
  };

  const handleArchive = async (userId) => {
    if (!window.confirm('Archive this user? They will no longer be able to log in.')) {
      return;
    }
    try {
      await usersApi.archive(userId);
      setSuccess('User archived');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to archive user');
    }
  };

  return (
    <div>
      <Navigation />
      <div className="admin-users-page">
        <h1>Users</h1>
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        <div className="admin-card">
          <h2>Create user</h2>
          <form onSubmit={handleCreate}>
            <div className="admin-form-grid">
              <FormField label="Name" htmlFor="name" required>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required />
              </FormField>
              <FormField label="Email" htmlFor="email" required>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </FormField>
              <FormField label="Password" htmlFor="password" required>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </FormField>
              <FormField label="Role" htmlFor="role" required>
                <select id="role" name="role" value={form.role} onChange={handleChange}>
                  <option value="user">Shop user</option>
                  <option value="tenant_admin">Organization admin</option>
                </select>
              </FormField>
              <FormField label="Organization" htmlFor="orgMode" required>
                <select id="orgMode" name="orgMode" value={form.orgMode} onChange={handleChange}>
                  <option value="new">Create new organization</option>
                  <option value="existing">Add to existing organization</option>
                </select>
              </FormField>
              {form.orgMode === 'new' ? (
                <FormField label="Organization name" htmlFor="tenantName">
                  <input id="tenantName" name="tenantName" type="text" value={form.tenantName} onChange={handleChange} placeholder="Defaults to the user's name" />
                </FormField>
              ) : (
                <FormField label="Existing organization" htmlFor="tenantId" required>
                  <select id="tenantId" name="tenantId" value={form.tenantId} onChange={handleChange} required>
                    <option value="">Select organization</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                </FormField>
              )}
            </div>
            {form.orgMode === 'existing' && form.tenantId && (
              <FormField label="Assign shops" htmlFor="shopIds">
                <div className="admin-checkbox-list">
                  {shops.length === 0 && <span>No shops in this organization yet.</span>}
                  {shops.map(shop => (
                    <label key={shop.id}>
                      <input
                        type="checkbox"
                        checked={form.shopIds.includes(shop.id)}
                        onChange={() => toggleFormShop(shop.id)}
                      />
                      {shop.name}
                    </label>
                  ))}
                </div>
              </FormField>
            )}
            <div className="form-actions">
              <button type="submit" className="admin-primary-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create user'}
              </button>
            </div>
          </form>
        </div>

        <div className="admin-card">
          <h2>All users</h2>
          <div className="table-container">
            <table className="common-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Organization</th>
                  <th>Shops</th>
                  <th>Password</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regularUsers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="table-empty">No tenant users yet.</td>
                  </tr>
                )}
                {regularUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => usersApi.assignRole(user.id, e.target.value).then(load).catch((err) => setError(err.message))}
                      >
                        <option value="user">Shop user</option>
                        <option value="tenant_admin">Organization admin</option>
                      </select>
                    </td>
                    <td>{user.tenant?.name || '-'}</td>
                    <td>{(user.shops || []).map(shop => shop.name).join(', ') || '-'}</td>
                    <td>
                      <div className="admin-password-cell">
                        <span>{revealed[user.id] || '••••••'}</span>
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => (
                            revealed[user.id]
                              ? setRevealed(prev => {
                                  const next = { ...prev };
                                  delete next[user.id];
                                  return next;
                                })
                              : handleReveal(user.id)
                          )}
                          aria-label={revealed[user.id] ? 'Hide password' : 'Show password'}
                        >
                          <EyeIcon off={!!revealed[user.id]} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <PermissionsIconButton
                        onClick={() => {
                          setError('');
                          setSuccess('');
                          setPermissionsUser(user);
                        }}
                      />
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="reset" onClick={() => { setResetId(user.id); setResetPassword(''); }}>Reset</button>
                        <button
                          type="button"
                          className="assign"
                          onClick={() => {
                            setAssigningId(user.id);
                            setAssignShopIds((user.shops || []).map(shop => shop.id));
                          }}
                        >
                          Shops
                        </button>
                        <button type="button" className="archive" onClick={() => handleArchive(user.id)}>Archive</button>
                      </div>
                      {resetId === user.id && (
                        <div className="admin-inline-form">
                          <input
                            type="text"
                            placeholder="New password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                          />
                          <button type="button" className="reset" onClick={() => handleReset(user.id)}>Save</button>
                        </div>
                      )}
                      {assigningId === user.id && (
                        <div>
                          <div className="admin-checkbox-list">
                            {shops.map(shop => (
                              <label key={shop.id}>
                                <input
                                  type="checkbox"
                                  checked={assignShopIds.includes(shop.id)}
                                  onChange={() => setAssignShopIds(prev => (
                                    prev.includes(shop.id)
                                      ? prev.filter(id => id !== shop.id)
                                      : [...prev, shop.id]
                                  ))}
                                />
                                {shop.name}
                              </label>
                            ))}
                          </div>
                          <div className="admin-inline-form">
                            <button type="button" className="assign" onClick={() => handleAssign(user.id)}>Save shops</button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {permissionsUser && (
        <PermissionsModal
          user={permissionsUser}
          onClose={() => setPermissionsUser(null)}
          onSaved={(updated) => {
            setSuccess(`Saved access for ${updated.name}`);
            setPermissionsUser((prev) => (prev ? { ...prev, permissions: updated.permissions } : prev));
          }}
        />
      )}
    </div>
  );
};

export default AdminUsers;
