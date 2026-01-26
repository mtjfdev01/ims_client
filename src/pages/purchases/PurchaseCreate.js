import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { purchasesApi, itemsApi } from '../../services/api';

const PurchaseCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemId: '',
    purchasePrice: 0,
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

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
      await purchasesApi.create({
        itemId: parseInt(formData.itemId),
        purchasePrice: formData.purchasePrice,
        quantity: formData.quantity || 1,
        purchaseDate: formData.purchaseDate
      });
      navigate('/purchases');
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Failed to create purchase: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const itemOptions = items.map(item => ({
    value: item.id,
    label: item.name ? `${item.name} (ID: ${item.id})` : `Item #${item.id}`
  }));

  return (
    <div>
      <Navigation />
      <FormWrapper title="Create Purchase" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Item" htmlFor="itemId">
            <Input
              type="dropdown"
              name="itemId"
              placeholder="Select Item"
              value={formData.itemId}
              onChange={handleChange}
              options={itemOptions}
            />
          </FormField>
          <FormField label="Purchase Price (per unit)" htmlFor="purchasePrice">
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
          <FormField label="Quantity" htmlFor="quantity">
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
          <FormField label="Purchase Date" htmlFor="purchaseDate">
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
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default PurchaseCreate;
