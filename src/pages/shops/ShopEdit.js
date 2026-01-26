import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { shopsApi, storesApi } from '../../services/api';
import '../FormPage.css';

const ShopEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    dealer: '',
    location: '',
    storeIds: []
  });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadStores();
  }, [id]);

  const loadStores = async () => {
    try {
      const data = await storesApi.getAll();
      setStores(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadData = async () => {
    try {
      const data = await shopsApi.getOne(id);
      setFormData({
        ...data,
        storeIds: data.stores?.map(s => s.id) || []
      });
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'storeIds') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFormData({
        ...formData,
        storeIds: selectedOptions
      });
    } else {
      const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
      setFormData({
        ...formData,
        [e.target.name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await shopsApi.update(id, formData);
      navigate('/shops');
    } catch (error) {
      console.error('Error updating shop:', error);
      alert('Failed to update shop');
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="form-wrapper-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Shop" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Name" htmlFor="name">
            <Input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Branch" htmlFor="branch">
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
          <FormField label="Dealer" htmlFor="dealer">
            <Input
              type="text"
              name="dealer"
              placeholder="Dealer"
              value={formData.dealer}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Location" htmlFor="location">
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
          <button type="submit" className="form-button form-button-primary">
            Update
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default ShopEdit;

