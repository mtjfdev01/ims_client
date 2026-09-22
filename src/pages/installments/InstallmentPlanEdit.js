import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { installmentsApi } from '../../services/api';

const InstallmentPlanEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({ title: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const plan = await installmentsApi.getPlan(id);
        setFormData({
          title: plan.title || '',
          notes: plan.notes || '',
        });
      } catch (error) {
        console.error('Error loading installment plan:', error);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    setLoading(true);
    try {
      await installmentsApi.updatePlan(id, {
        title: formData.title.trim(),
        notes: formData.notes.trim() || null,
      });
      navigate(`/installments/plans/${id}`);
    } catch (error) {
      alert(error.message || 'Failed to update plan');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Navigation />
        <div className="form-wrapper-container"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Installment Plan" onSubmit={handleSubmit}>
        <p className="sale-payment-hint">
          Schedule and amounts stay fixed after create so paid rows cannot be rewritten.
        </p>
        <FormField label="Title" htmlFor="title" required>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </FormField>
        <FormField label="Notes" htmlFor="notes">
          <Input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </FormField>
        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/installments/plans/${id}`)} className="form-button form-button-secondary">
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

export default InstallmentPlanEdit;
