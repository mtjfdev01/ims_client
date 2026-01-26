import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { storesApi, shopsApi } from '../../services/api';

const StoreEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    shopIds: []
  });
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadShops();
  }, [id]);

  const loadShops = async () => {
    try {
      const data = await shopsApi.getAll();
      setShops(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error loading shops:', error);
    }
  };

  const loadData = async () => {
    try {
      const data = await storesApi.getOne(id);
      setFormData({
        ...data,
        shopIds: data.shops?.map(s => s.id) || []
      });
    } catch (error) {
      console.error('Error loading store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'shopIds') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFormData({
        ...formData,
        shopIds: selectedOptions
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await storesApi.update(id, formData);
      navigate('/stores');
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Failed to update store');
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
      <FormWrapper title="Edit Store" onSubmit={handleSubmit}>
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
          <FormField label="Shops" htmlFor="shopIds">
            <Input
              type="dropdown"
              name="shopIds"
              placeholder="Select Shops (optional)"
              value={formData.shopIds}
              onChange={handleChange}
              options={shops.map(shop => ({ value: shop.id, label: shop.name }))}
              multiple={true}
            />
          </FormField>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/stores')} className="form-button form-button-secondary">
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

export default StoreEdit;

