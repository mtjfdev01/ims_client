import React, { useEffect, useState } from 'react';
import FormField from './FormField';
import { usersApi } from '../services/api';
import { isSuperAdmin } from '../services/session';

const OrganizationField = ({ orgMode, tenantId, tenantName, onChange }) => {
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(isSuperAdmin());

  useEffect(() => {
    if (!isSuperAdmin()) {
      return;
    }
    setLoadingTenants(true);
    usersApi.getTenants()
      .then((rows) => setTenants(rows || []))
      .catch(() => setTenants([]))
      .finally(() => setLoadingTenants(false));
  }, []);

  if (!isSuperAdmin()) {
    return null;
  }

  return (
    <div className="form-fields-row">
      <FormField label="Organization" htmlFor="orgMode" required>
        <select id="orgMode" name="orgMode" value={orgMode} onChange={onChange}>
          <option value="existing">Use existing organization</option>
          <option value="new">Create new organization</option>
        </select>
      </FormField>
      {orgMode === 'new' ? (
        <FormField label="Organization name" htmlFor="tenantName" required>
          <input
            id="tenantName"
            name="tenantName"
            type="text"
            value={tenantName}
            onChange={onChange}
            required
            placeholder="e.g. Acme Retail"
          />
        </FormField>
      ) : (
        <FormField label="Select organization" htmlFor="tenantId" required>
          <select id="tenantId" name="tenantId" value={tenantId} onChange={onChange} required>
            <option value="">
              {loadingTenants ? 'Loading organizations...' : (tenants.length ? 'Select organization' : 'No organizations yet — create one')}
            </option>
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
            ))}
          </select>
        </FormField>
      )}
    </div>
  );
};

export default OrganizationField;
