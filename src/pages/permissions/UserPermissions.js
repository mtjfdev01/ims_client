import React, { useEffect, useState } from 'react';
import Navigation from '../../components/Navigation';
import PermissionsModal, { PermissionsIconButton } from '../../components/PermissionsModal';
import { userPermissionsApi, usersApi } from '../../services/api';
import { mergeModuleCatalog } from '../../services/appModules';
import { getViewTenantId, isSuperAdmin } from '../../services/session';
import '../admin/AdminUsers.css';
import './UserPermissions.css';

const UserPermissions = () => {
  const [catalog, setCatalog] = useState([]);
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState(getViewTenantId() || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(null);

  const load = async (nextTenantId = tenantId) => {
    setLoading(true);
    setError('');
    try {
      const result = await userPermissionsApi.list(nextTenantId || undefined);
      setCatalog(mergeModuleCatalog(result.modules || []));
      setUsers(result.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
    if (isSuperAdmin()) {
      usersApi.getTenants().then(setTenants).catch(() => setTenants([]));
    }
  }, []);

  const handleTenantChange = (e) => {
    const value = e.target.value;
    setTenantId(value);
    load(value);
  };

  const handleSaved = (updated) => {
    setUsers((prev) => prev.map((user) => (
      user.id === updated.id ? { ...user, permissions: updated.permissions } : user
    )));
    setSuccess(`Saved access for ${updated.name}`);
  };

  return (
    <div>
      <Navigation />
      <div className="admin-users-page">
        <h1>User permissions</h1>
        <p className="permissions-hint">
          Open a person to choose the modules they can see. The navbar only shows the modules they have.
        </p>
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        {isSuperAdmin() && (
          <div className="admin-card">
            <label htmlFor="permissions-tenant">Organization</label>
            <select id="permissions-tenant" value={tenantId} onChange={handleTenantChange}>
              <option value="">All organizations</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="admin-card">
          {loading ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <p className="table-empty">No users in this organization.</p>
          ) : (
            <ul className="permissions-user-list">
              {users.map((user) => (
                <li key={user.id} className="permissions-user-row">
                  <div className="permissions-user">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span className="permissions-role">
                      {user.role === 'tenant_admin' ? 'Organization admin' : 'Shop user'}
                      {user.tenant?.name ? ` · ${user.tenant.name}` : ''}
                    </span>
                  </div>
                  <div className="permissions-user-tools">
                    <span className="permissions-count">{(user.permissions || []).length} modules</span>
                    <PermissionsIconButton
                      count={(user.permissions || []).length}
                      onClick={() => {
                        setSuccess('');
                        setActiveUser(user);
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {activeUser && (
        <PermissionsModal
          user={activeUser}
          catalog={catalog}
          onClose={() => setActiveUser(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default UserPermissions;
