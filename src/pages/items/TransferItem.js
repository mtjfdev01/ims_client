import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { itemsApi, storesApi, shopsApi } from '../../services/api';
import '../FormPage.css';

const TransferItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    itemId: '',
    fromStoreId: '',
    fromShopId: '',
    toStoreId: '',
    toShopId: '',
    quantity: 1,
    notes: ''
  });
  const [stores, setStores] = useState([]);
  const [shops, setShops] = useState([]);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transferType, setTransferType] = useState(''); // 'store-to-shop' or 'shop-to-store'

  useEffect(() => {
    // Get itemId and source from query params
    const params = new URLSearchParams(location.search);
    const itemId = params.get('itemId');
    const fromStoreId = params.get('fromStoreId');
    const fromShopId = params.get('fromShopId');

    if (itemId) {
      setFormData(prev => ({
        ...prev,
        itemId: itemId,
        fromStoreId: fromStoreId || '',
        fromShopId: fromShopId || ''
      }));

      if (fromStoreId) {
        setTransferType('store-to-shop');
      } else if (fromShopId) {
        setTransferType('shop-to-store');
      }

      // Load item data to show current quantity
      loadItemData(itemId);
    }

    loadStores();
    loadShops();
  }, [location.search]);

  const loadItemData = async (itemId) => {
    try {
      const item = await itemsApi.getOne(itemId);
      setItemData(item);
      // Set max quantity to current quantity
      if (item.quantity) {
        setFormData(prev => ({
          ...prev,
          quantity: Math.min(prev.quantity || 1, item.quantity)
        }));
      }
    } catch (error) {
      console.error('Error loading item data:', error);
    }
  };

  const loadStores = async () => {
    try {
      const data = await storesApi.getAll();
      setStores(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadShops = async () => {
    try {
      const data = await shopsApi.getAll();
      setShops(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Error loading shops:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'quantity') {
      const value = parseInt(e.target.value) || 1;
      const maxQuantity = itemData?.quantity || 1;
      const finalValue = Math.min(Math.max(1, value), maxQuantity);
      setFormData({
        ...formData,
        quantity: finalValue
      });
    } else {
      const value = e.target.value;
      setFormData({
        ...formData,
        [e.target.name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate transfer direction
    if (transferType === 'store-to-shop' && !formData.toShopId) {
      alert('Please select a destination shop');
      return;
    }
    if (transferType === 'shop-to-store' && !formData.toStoreId) {
      alert('Please select a destination store');
      return;
    }

    // Validate quantity
    const transferQuantity = parseInt(formData.quantity) || 1;
    const availableQuantity = itemData?.quantity || 0;
    if (transferQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    if (transferQuantity > availableQuantity) {
      alert(`Cannot transfer ${transferQuantity} units. Only ${availableQuantity} units available.`);
      return;
    }

    setLoading(true);
    try {
      const transferData = {
        itemId: parseInt(formData.itemId),
        quantity: parseInt(formData.quantity) || 1,
        fromStoreId: formData.fromStoreId ? parseInt(formData.fromStoreId) : undefined,
        fromShopId: formData.fromShopId ? parseInt(formData.fromShopId) : undefined,
        toStoreId: formData.toStoreId ? parseInt(formData.toStoreId) : undefined,
        toShopId: formData.toShopId ? parseInt(formData.toShopId) : undefined,
        notes: formData.notes || undefined
      };

      await itemsApi.transfer(transferData);
      
      // Navigate back to source location
      if (formData.fromStoreId) {
        navigate(`/stores/${formData.fromStoreId}/items`);
      } else if (formData.fromShopId) {
        navigate(`/shops/${formData.fromShopId}/items`);
      } else {
        navigate('/items');
      }
    } catch (error) {
      console.error('Error transferring item:', error);
      alert('Failed to transfer item: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const storeOptions = stores.map(store => ({ value: store.id, label: store.name }));
  const shopOptions = shops.map(shop => ({ value: shop.id, label: shop.name }));

  return (
    <div>
      <Navigation />
      <FormWrapper title="Transfer Item" onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <div><strong>Item ID:</strong> {formData.itemId}</div>
          {itemData && (
            <div style={{ marginTop: '8px' }}>
              <strong>Available Quantity:</strong> {itemData.quantity || 0} units
              {itemData.company && <div><strong>Company:</strong> {itemData.company.name}</div>}
            </div>
          )}
        </div>
        
        {transferType === 'store-to-shop' && (
          <>
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
              <strong>From Store:</strong> {stores.find(s => s.id === parseInt(formData.fromStoreId))?.name || 'N/A'}
            </div>
            <FormField label="Destination Shop" htmlFor="toShopId" required>
              <Input
                type="dropdown"
                id="toShopId"
                name="toShopId"
                placeholder="Select Destination Shop"
                value={formData.toShopId}
                onChange={handleChange}
                options={shopOptions}
                required
              />
            </FormField>
          </>
        )}

        {transferType === 'shop-to-store' && (
          <>
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
              <strong>From Shop:</strong> {shops.find(s => s.id === parseInt(formData.fromShopId))?.name || 'N/A'}
            </div>
            <FormField label="Destination Store" htmlFor="toStoreId" required>
              <Input
                type="dropdown"
                id="toStoreId"
                name="toStoreId"
                placeholder="Select Destination Store"
                value={formData.toStoreId}
                onChange={handleChange}
                options={storeOptions}
                required
              />
            </FormField>
          </>
        )}

        <FormField label="Quantity" htmlFor="quantity" required>
          <Input
            type="number"
            id="quantity"
            name="quantity"
            placeholder="Quantity to Transfer"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            max={itemData?.quantity || 1}
            required
          />
        </FormField>
        {itemData && (
          <div style={{ marginTop: '-10px', marginBottom: '15px', fontSize: '12px', color: '#666' }}>
            Maximum: {itemData.quantity} units
          </div>
        )}

        <FormField label="Notes (optional)" htmlFor="notes">
          <Input
            type="text"
            id="notes"
            name="notes"
            placeholder="Notes (optional)"
            value={formData.notes}
            onChange={handleChange}
          />
        </FormField>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => {
              if (formData.fromStoreId) {
                navigate(`/stores/${formData.fromStoreId}/items`);
              } else if (formData.fromShopId) {
                navigate(`/shops/${formData.fromShopId}/items`);
              } else {
                navigate('/items');
              }
            }} 
            className="form-button form-button-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Transferring...' : 'Transfer Item'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default TransferItem;
