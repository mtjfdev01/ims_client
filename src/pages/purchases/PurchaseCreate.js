import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { purchasesApi } from '../../services/api';
import { ItemSearchSelect, SellerSearchSelect } from '../../components/entitySearchSelects';
import InlineCreatePanel from '../../components/InlineCreatePanel';
import RequireShop from '../../components/RequireShop';
import { hasPermission } from '../../services/session';

const PurchaseCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemId: '',
    purchasePrice: '',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    sellerId: '',
    newSellerName: '',
    newSellerPhone: '',
    newSellerCnic: '',
  });
  const [loading, setLoading] = useState(false);
  const canUseSellers = hasPermission('sellers');

  const handleChange = (e) => {
    const value = e.target.value;
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
      const payload = {
        itemId: parseInt(formData.itemId),
        purchasePrice: formData.purchasePrice,
        quantity: formData.quantity || 1,
        purchaseDate: formData.purchaseDate,
      };
      if (formData.sellerId) {
        payload.sellerId = parseInt(formData.sellerId);
      } else if (formData.newSellerName.trim()) {
        payload.newSeller = {
          name: formData.newSellerName.trim(),
          phone: formData.newSellerPhone.trim() || undefined,
          cnic: formData.newSellerCnic.trim() || undefined,
        };
      }
      await purchasesApi.create(payload);
      navigate('/purchases');
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Failed to create purchase: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <RequireShop block>
      <FormWrapper title="Create Purchase" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Item" htmlFor="itemId" required>
            <ItemSearchSelect
              id="itemId"
              name="itemId"
              shopOnly
              placeholder="Search item"
              value={formData.itemId}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Price per unit" htmlFor="purchasePrice" required>
            <Input
              type="number"
              name="purchasePrice"
              placeholder="Purchase Price (per unit)"
              value={formData.purchasePrice}
              onChange={handleChange}
              step="any"
              min="0"
            />
          </FormField>
        </div>
        <div className="form-fields-row">
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
          <FormField label="Purchase Date" htmlFor="purchaseDate" required>
            <Input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
            />
          </FormField>
        </div>
        {canUseSellers && (
          <div className="form-fields-row">
            <FormField label="Seller" htmlFor="sellerId">
              <SellerSearchSelect
                id="sellerId"
                name="sellerId"
                placeholder="Search seller"
                value={formData.sellerId}
                onChange={handleChange}
              />
            </FormField>
          </div>
        )}
        {canUseSellers && !formData.sellerId && (
          <InlineCreatePanel title="Add new seller">
            <div className="form-fields-row">
              <FormField label="Seller name" htmlFor="newSellerName">
                <Input
                  type="text"
                  name="newSellerName"
                  placeholder="Optional new seller"
                  value={formData.newSellerName}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Phone" htmlFor="newSellerPhone">
                <Input
                  type="text"
                  name="newSellerPhone"
                  placeholder="Optional phone"
                  value={formData.newSellerPhone}
                  onChange={handleChange}
                />
              </FormField>
            </div>
            <div className="form-fields-row">
              <FormField label="CNIC" htmlFor="newSellerCnic">
                <Input
                  type="text"
                  name="newSellerCnic"
                  placeholder="Optional CNIC"
                  value={formData.newSellerCnic}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </InlineCreatePanel>
        )}
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/purchases')} className="form-button form-button-secondary">
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

export default PurchaseCreate;
