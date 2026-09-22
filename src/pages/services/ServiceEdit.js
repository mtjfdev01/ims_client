import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import SalePaymentFields from '../sales/SalePaymentFields';
import { customersApi, servicesApi, unwrapList } from '../../services/api';
import {
  buildSalePaymentPayload,
  emptyPaymentForm,
  paymentFormFromSale,
  validatePaymentForm,
} from '../sales/salePayment';
import '../sales/SaleCreate.css';

const ServiceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    kind: 'other',
    notes: '',
    amount: '',
  });
  const [customers, setCustomers] = useState([]);
  const [payment, setPayment] = useState(emptyPaymentForm());
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [job, customerData] = await Promise.all([
          servicesApi.getOne(id),
          customersApi.getAll(),
        ]);
        setFormData({
          title: job.title || '',
          kind: job.kind || 'other',
          notes: job.notes || '',
          amount: job.amount == null ? '' : String(job.amount),
        });
        setPayment(paymentFormFromSale(job));
        setCustomers(unwrapList(customerData));
      } catch (error) {
        console.error('Error loading service:', error);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id]);

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
      await servicesApi.update(id, {
        title: formData.title.trim(),
        kind: formData.kind || 'other',
        notes: formData.notes.trim() || null,
        amount,
        ...buildSalePaymentPayload(payment, amount, { allowClearCustomer: true }),
      });
      navigate('/services');
    } catch (error) {
      alert(error.message || 'Failed to update service');
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

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Service" onSubmit={handleSubmit}>
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
              step="0.01"
            />
          </FormField>
          <FormField label="Profit" htmlFor="profit">
            <Input type="text" name="profit" value={amount.toFixed(2)} disabled />
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
          customers={customers}
          value={payment}
          onChange={setPayment}
          allowNewCustomer={false}
        />
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/services')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Service'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default ServiceEdit;
