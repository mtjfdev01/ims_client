import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import Table from '../../components/Table';
import PermissionsModal, { PermissionsIconButton } from '../../components/PermissionsModal';
import { shopsApi, usersApi } from '../../services/api';
import { roleLabel } from './userLabels';
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
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissionsUser, setPermissionsUser] = useState(null);

  const selectedTenantId = form.orgMode === 'existing' ? form.tenantId : '';

  const load = async () => {
    setListLoading(true);
    try {
      const [userRows, tenantRows] = await Promise.all([
        usersApi.getAll(),
        usersApi.getTenants(),
      ]);
      setUsers(userRows || []);
      setTenants(tenantRows || []);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load().catch((err) => {
      setError(err.message || 'Failed to load users');
      setListLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedTenantId) {
      setShops([]);
      setShopsLoading(false);
      return;
    }
    setShopsLoading(true);
    shopsApi.getAll(undefined, undefined, { tenantId: selectedTenantId }).then((data) => {
      setShops(Array.isArray(data) ? data : (data.data || []));
    }).catch(() => setShops([])).finally(() => setShopsLoading(false));
  }, [selectedTenantId]);

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

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', render: (value) => roleLabel(value) },
    { header: 'Organization', accessor: 'tenant', render: (value) => value?.name || '—' },
    {
      header: 'Shops',
      accessor: 'shops',
      render: (value) => (value || []).map(shop => shop.name).join(', ') || '—',
    },
    {
      header: 'Permissions',
      accessor: 'id',
      render: (_id, row) => (
        <PermissionsIconButton
          onClick={() => {
            setError('');
            setSuccess('');
            setPermissionsUser(row);
          }}
        />
      ),
    },
  ];

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
                  {shopsLoading && <span>Loading shops...</span>}
                  {!shopsLoading && shops.length === 0 && <span>No shops in this organization yet.</span>}
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
          <Table
            columns={columns}
            data={regularUsers}
            loading={listLoading}
            emptyMessage="No tenant users yet."
            onView={(id) => navigate(`/admin/users/${id}`)}
            onEdit={(id) => navigate(`/admin/users/${id}/edit`)}
            onDelete={handleArchive}
          />
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
