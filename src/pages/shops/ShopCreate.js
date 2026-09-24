import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import OrganizationField from '../../components/OrganizationField';
import { shopsApi, storesApi } from '../../services/api';
import { getUser, isSuperAdmin, setViewTenantId, updateStoredUser } from '../../services/session';
import '../FormPage.css';

const ShopCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    dealer: '',
    location: '',
    storeIds: [],
    orgMode: 'new',
    tenantId: '',
    tenantName: '',
  });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await storesApi.getAll();
      setStores(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'storeIds') {
      // Handle multiple select dropdown
      const selectedOptions = e.target.selectedOptions 
        ? Array.from(e.target.selectedOptions, option => parseInt(option.value))
        : (Array.isArray(e.target.value) ? e.target.value : []);
      setFormData({
        ...formData,
        storeIds: selectedOptions
      });
    } else {
      const value = e.target.value;
      setFormData({
        ...formData,
        [e.target.name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        branch: formData.branch,
        dealer: formData.dealer,
        location: formData.location,
        storeIds: formData.storeIds,
      };
      if (isSuperAdmin()) {
        if (formData.orgMode === 'new') {
          payload.tenantName = formData.tenantName.trim();
        } else if (formData.tenantId) {
          payload.tenantId = Number(formData.tenantId);
        }
      }
      const shop = await shopsApi.create(payload);
      if (shop?.tenant?.id) {
        setViewTenantId(shop.tenant.id);
      } else if (payload.tenantId) {
        setViewTenantId(payload.tenantId);
      }
      const user = getUser();
      if (user && !isSuperAdmin(user) && shop?.id) {
        updateStoredUser({
          ...user,
          shops: [...(user.shops || []).filter(existing => existing.id !== shop.id), { id: shop.id, name: shop.name }],
        });
      }
      navigate('/shops');
    } catch (err) {
      console.error('Error creating shop:', err);
      setError(err.message || 'Failed to create shop');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <FormWrapper title="Create Shop" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <OrganizationField
          orgMode={formData.orgMode}
          tenantId={formData.tenantId}
          tenantName={formData.tenantName}
          onChange={handleChange}
        />
        <div className="form-fields-row">
          <FormField label="Name" htmlFor="name" required>
            <Input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Branch" htmlFor="branch" required>
            <Input
              type="text"
              name="branch"
              placeholder="Branch"
              value={formData.branch}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Dealer" htmlFor="dealer" required>
            <Input
              type="text"
              name="dealer"
              placeholder="Dealer"
              value={formData.dealer}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Location" htmlFor="location" required>
            <Input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Stores" htmlFor="storeIds">
            <Input
              type="dropdown"
              name="storeIds"
              placeholder="Select Stores (optional)"
              value={formData.storeIds}
              onChange={handleChange}
              options={stores.map(store => ({ value: store.id, label: store.name }))}
              multiple={true}
            />
          </FormField>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/shops')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default ShopCreate;

