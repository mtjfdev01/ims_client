import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { purchasesApi } from '../../services/api';
import { ItemSearchSelect, SellerSearchSelect } from '../../components/entitySearchSelects';
import InlineCreatePanel from '../../components/InlineCreatePanel';
import { itemNameLabel, itemOptionLabel } from '../items/itemCondition';
import { hasPermission } from '../../services/session';

const PurchaseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    itemId: '',
    itemLabel: '',
    purchasePrice: '',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    sellerId: '',
    sellerLabel: '',
    newSellerName: '',
    newSellerPhone: '',
    newSellerCnic: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const canUseSellers = hasPermission('sellers');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const data = await purchasesApi.getOne(id);
      setFormData({
        itemId: data.item?.id || data.itemId || '',
        itemLabel: data.item ? itemNameLabel(data.item) : '',
        purchasePrice: data.purchasePrice == null || data.purchasePrice === '' ? '' : data.purchasePrice,
        quantity: data.quantity || 1,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        sellerId: data.seller?.id || data.sellerId || '',
        sellerLabel: data.seller
          ? [data.seller.phone, data.seller.cnic].filter(Boolean).length
            ? `${data.seller.name} (${[data.seller.phone, data.seller.cnic].filter(Boolean).join(' · ')})`
            : data.seller.name
          : '',
        newSellerName: '',
        newSellerPhone: '',
        newSellerCnic: '',
      });
    } catch (error) {
      console.error('Error loading purchase:', error);
    } finally {
      setLoadingData(false);
    }
  };

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
        sellerId: formData.sellerId ? parseInt(formData.sellerId) : null,
      };
      if (!formData.sellerId && formData.newSellerName.trim()) {
        delete payload.sellerId;
        payload.newSeller = {
          name: formData.newSellerName.trim(),
          phone: formData.newSellerPhone.trim() || undefined,
          cnic: formData.newSellerCnic.trim() || undefined,
        };
      }
      await purchasesApi.update(id, payload);
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

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Purchase" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Item" htmlFor="itemId" required>
            <ItemSearchSelect
              id="itemId"
              name="itemId"
              shopOnly
              placeholder="Search item"
              value={formData.itemId}
              selectedLabel={formData.itemLabel}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Purchase Price (per unit)" htmlFor="purchasePrice" required>
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
                selectedLabel={formData.sellerLabel}
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
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default PurchaseEdit;
