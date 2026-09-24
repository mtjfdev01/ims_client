import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { issuesApi } from '../../services/api';
import { locationLabel } from './locationLabel';
import { itemOptionLabel } from '../items/itemCondition';

const StockTransferEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [summary, setSummary] = useState('');
  const [formData, setFormData] = useState({ quantity: 1, notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const row = await issuesApi.getOne(id);
        if (row?.error) {
          throw new Error('Stock transfer not found');
        }
        setFormData({
          quantity: row.quantity || 1,
          notes: row.notes || '',
        });
        setSummary(`${itemOptionLabel(row.item)} · ${locationLabel(row.fromShop, row.fromStore)} → ${locationLabel(row.toShop, row.toStore)}`);
      } catch (error) {
        alert(error.message || 'Failed to load stock transfer');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (formData.quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      await issuesApi.update(id, {
        quantity: Number(formData.quantity),
        notes: formData.notes.trim() || undefined,
      });
      navigate(`/stock-transfers/${id}`);
    } catch (error) {
      alert(error.message || 'Failed to update stock transfer');
      setSaving(false);
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
      <FormWrapper title="Edit Stock Transfer" onSubmit={handleSubmit}>
        {summary && <p className="form-hint">{summary}</p>}
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
        <FormField label="Notes" htmlFor="notes">
          <Input
            type="text"
            name="notes"
            placeholder="Optional notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </FormField>
        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/stock-transfers/${id}`)} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default StockTransferEdit;
