import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { expensesApi } from '../../services/api';

const ExpenseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    description: '',
    price: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const data = await expensesApi.getOne(id);
      setFormData(data);
    } catch (error) {
      console.error('Error loading expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await expensesApi.update(id, formData);
      navigate('/expenses');
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense');
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
      <FormWrapper title="Edit Expense" onSubmit={handleSubmit}>
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
          <button type="submit" className="form-button form-button-primary">
            Update
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default ExpenseEdit;

