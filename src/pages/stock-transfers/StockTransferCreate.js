import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { issuesApi, shopsApi, storesApi, unwrapList } from '../../services/api';
import { ItemSearchSelect } from '../../components/entitySearchSelects';

const StockTransferCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemId: '',
    fromType: 'shop',
    fromId: '',
    toType: 'shop',
    toId: '',
    quantity: 1,
    notes: '',
  });
  const [shops, setShops] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    shopsApi.getAll().then((result) => setShops(unwrapList(result))).catch(() => setShops([]));
    storesApi.getAll().then((result) => setStores(unwrapList(result))).catch(() => setStores([]));
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!formData.itemId) {
      alert('Please select an item');
      return;
    }
    if (!formData.fromId || !formData.toId) {
      alert('Please choose a source and destination');
      return;
    }
    if (formData.quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    setLoading(true);
    try {
      await issuesApi.create({
        itemId: Number(formData.itemId),
        quantity: Number(formData.quantity),
        notes: formData.notes.trim() || undefined,
        fromShopId: formData.fromType === 'shop' ? Number(formData.fromId) : undefined,
        fromStoreId: formData.fromType === 'store' ? Number(formData.fromId) : undefined,
        toShopId: formData.toType === 'shop' ? Number(formData.toId) : undefined,
        toStoreId: formData.toType === 'store' ? Number(formData.toId) : undefined,
      });
      navigate('/stock-transfers');
    } catch (error) {
      alert(error.message || 'Failed to create stock transfer');
      setLoading(false);
    }
  };

  const shopOptions = shops.map((shop) => ({ value: shop.id, label: shop.name }));
  const storeOptions = stores.map((store) => ({ value: store.id, label: store.name }));
  const fromOptions = formData.fromType === 'store' ? storeOptions : shopOptions;
  const toOptions = formData.toType === 'store' ? storeOptions : shopOptions;

  return (
    <div>
      <Navigation />
      <FormWrapper title="Create Stock Transfer" onSubmit={handleSubmit}>
        <FormField label="Item" htmlFor="itemId" required>
          <ItemSearchSelect
            id="itemId"
            name="itemId"
            placeholder="Search item"
            value={formData.itemId}
            onChange={handleChange}
          />
        </FormField>
        <div className="form-fields-row">
          <FormField label="From type" htmlFor="fromType" required>
            <Input
              type="dropdown"
              name="fromType"
              value={formData.fromType}
              onChange={(e) => setFormData((prev) => ({ ...prev, fromType: e.target.value, fromId: '' }))}
              options={[{ value: 'shop', label: 'Shop' }, { value: 'store', label: 'Store' }]}
            />
          </FormField>
          <FormField label="From" htmlFor="fromId" required>
            <Input
              type="dropdown"
              name="fromId"
              placeholder="Select source"
              value={formData.fromId}
              onChange={handleChange}
              options={fromOptions}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="To type" htmlFor="toType" required>
            <Input
              type="dropdown"
              name="toType"
              value={formData.toType}
              onChange={(e) => setFormData((prev) => ({ ...prev, toType: e.target.value, toId: '' }))}
              options={[{ value: 'shop', label: 'Shop' }, { value: 'store', label: 'Store' }]}
            />
          </FormField>
          <FormField label="To" htmlFor="toId" required>
            <Input
              type="dropdown"
              name="toId"
              placeholder="Select destination"
              value={formData.toId}
              onChange={handleChange}
              options={toOptions}
            />
          </FormField>
        </div>
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
          <button type="button" onClick={() => navigate('/stock-transfers')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Create'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default StockTransferCreate;
