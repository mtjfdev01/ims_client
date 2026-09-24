import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import RequireShop from '../../components/RequireShop';
import SalePaymentFields from '../sales/SalePaymentFields';
import { servicesApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import {
  buildSalePaymentPayload,
  emptyPaymentForm,
  validatePaymentForm,
} from '../sales/salePayment';
import '../sales/SaleCreate.css';

const ServiceCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    kind: 'other',
    notes: '',
    amount: '',
  });
  const [payment, setPayment] = useState(emptyPaymentForm());
  const [loading, setLoading] = useState(false);

  const amount = Number(formData.amount || 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.title.trim()) {
      alert('Service title is required');
      return;
    }
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    const paymentError = validatePaymentForm(payment, amount);
    if (paymentError) {
      alert(paymentError);
      return;
    }
    setLoading(true);
    try {
      await servicesApi.create({
        title: formData.title.trim(),
        kind: formData.kind || 'other',
        notes: formData.notes.trim() || undefined,
        amount,
        ...buildSalePaymentPayload(payment, amount),
      });
      navigate('/services');
    } catch (error) {
      alert(error.message || 'Failed to create service');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <RequireShop block>
        <FormWrapper title="Create Service" onSubmit={handleSubmit}>
          <p className="sale-payment-hint">
            Use this for repairs, consultancy, pouches, hands-free work, and other jobs that do not take stock.
            The full charge is counted as profit.
          </p>
          <div className="form-fields-row">
            <FormField label="Service" htmlFor="title" required>
              <Input
                type="text"
                name="title"
                placeholder="Phone repair, consultancy, pouch..."
                value={formData.title}
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Type" htmlFor="kind">
              <Input
                type="text"
                name="kind"
                placeholder="Repair, consultancy, or any work"
                value={formData.kind}
                onChange={handleChange}
              />
            </FormField>
          </div>
          <div className="form-fields-row">
            <FormField label="Amount" htmlFor="amount" required>
              <Input
                type="number"
                name="amount"
                placeholder="Charge amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                step="any"
              />
            </FormField>
            <FormField label="Profit" htmlFor="profit">
              <Input type="text" name="profit" value={formatAmount(amount)} disabled />
            </FormField>
          </div>
          <FormField label="Notes" htmlFor="notes">
            <Input
              type="text"
              name="notes"
              placeholder="Optional details"
              value={formData.notes}
              onChange={handleChange}
            />
          </FormField>
          <SalePaymentFields
            totalAmount={amount}
            value={payment}
            onChange={setPayment}
          />
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/services')} className="form-button form-button-secondary">
              Cancel
            </button>
            <button type="submit" className="form-button form-button-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </FormWrapper>
      </RequireShop>
    </div>
  );
};

export default ServiceCreate;
