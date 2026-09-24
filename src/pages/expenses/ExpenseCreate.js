import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { expensesApi } from '../../services/api';
import RequireShop from '../../components/RequireShop';
import { useShop } from '../../contexts/ShopContext';

const ExpenseCreate = () => {
  const navigate = useNavigate();
  const { selectedShop } = useShop();
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    shopId: null
  });
  const [loading, setLoading] = useState(false);

  // Update shopId when selectedShop changes
  useEffect(() => {
    if (selectedShop) {
      setFormData(prev => ({
        ...prev,
        shopId: selectedShop.id
      }));
    }
  }, [selectedShop]);

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    // Ensure shopId is set from selectedShop if available
    const submitData = {
      ...formData,
      shopId: selectedShop?.id || formData.shopId || null
    };
    
    setLoading(true);
    try {
      await expensesApi.create(submitData);
      navigate('/expenses');
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <RequireShop block>
      <FormWrapper title="Create Expense" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Description" htmlFor="description" required>
            <Input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Price" htmlFor="price" required>
            <Input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/expenses')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </FormWrapper>
      </RequireShop>
    </div>
  );
};

export default ExpenseCreate;

