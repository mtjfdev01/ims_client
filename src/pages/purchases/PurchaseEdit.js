import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { purchasesApi, itemsApi } from '../../services/api';

const PurchaseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    itemId: '',
    purchasePrice: 0,
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
    loadItems();
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const data = await purchasesApi.getOne(id);
      setFormData({
        itemId: data.item?.id || data.itemId || '',
        purchasePrice: data.purchasePrice || 0,
        quantity: data.quantity || 1,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error loading purchase:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadItems = async () => {
    try {
      const data = await itemsApi.getAll();
      const itemsArray = Array.isArray(data) ? data : (data.data || []);
      setItems(itemsArray);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.itemId) {
      alert('Please select an item');
      return;
    }

    if (formData.purchasePrice <= 0) {
      alert('Purchase price must be greater than 0');
      return;
    }

    if (formData.quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await purchasesApi.update(id, {
        itemId: parseInt(formData.itemId),
        purchasePrice: formData.purchasePrice,
        quantity: formData.quantity || 1,
        purchaseDate: formData.purchaseDate
      });
      navigate('/purchases');
    } catch (error) {
      console.error('Error updating purchase:', error);
      alert('Failed to update purchase: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Navigation />
        <div className="form-wrapper-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const itemOptions = items.map(item => ({
    value: item.id,
    label: item.name ? `${item.name} (ID: ${item.id})` : `Item #${item.id}`
  }));

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Purchase" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Item" htmlFor="itemId" required>
            <Input
              type="dropdown"
              name="itemId"
              placeholder="Select Item"
              value={formData.itemId}
              onChange={handleChange}
              options={itemOptions}
            />
          </FormField>
          <FormField label="Purchase Price (per unit)" htmlFor="purchasePrice" required>
            <Input
              type="number"
              name="purchasePrice"
              placeholder="Purchase Price (per unit)"
              value={formData.purchasePrice}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </FormField>
          <FormField label="Quantity" htmlFor="quantity" required>
            <Input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Purchase Date" htmlFor="purchaseDate" required>
            <Input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/purchases')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default PurchaseEdit;
