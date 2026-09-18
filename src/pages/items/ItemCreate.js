import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { itemsApi, companiesApi, categoriesApi, storesApi, shopsApi, unwrapList } from '../../services/api';
import { useShop } from '../../contexts/ShopContext';
import { getAssignedShops, getUser } from '../../services/session';

const ItemCreate = () => {
  const navigate = useNavigate();
  const { selectedShop, selectedStore, shopStores } = useShop();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    categories: [],
    storeId: '',
    shopId: '',
    location: '',
    quantity: 1,
    purchasePrice: 0,
    minimumSalePrice: 0
  });
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = getUser();
  const assignedShops = getAssignedShops(user);
  const availableShops = user?.role === 'user'
    ? shops.filter(shop => assignedShops.some(assigned => assigned.id === shop.id))
    : shops;
  const availableStores = user?.role === 'user'
    ? (Array.isArray(shopStores) ? shopStores : [])
    : stores;
  const showShopSelect = availableShops.length > 1;
  const showStoreSelect = availableStores.length > 1;

  useEffect(() => {
    loadCompanies();
    loadCategories();
    loadStores();
    loadShops();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companiesApi.getAll();
      setCompanies(unwrapList(data));
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(unwrapList(data));
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStores = async () => {
    try {
      const data = await storesApi.getAll();
      setStores(unwrapList(data));
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadShops = async () => {
    try {
      const data = await shopsApi.getAll();
      setShops(unwrapList(data));
    } catch (error) {
      console.error('Error loading shops:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'categories') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
      setFormData({
        ...formData,
        categories: selectedOptions
      });
    } else if (e.target.name === 'storeId') {
      // When selecting a store, clear shop
      const value = e.target.value ? parseInt(e.target.value) : '';
      setFormData({
        ...formData,
        storeId: value,
        shopId: '' // Clear shop when store is selected
      });
    } else if (e.target.name === 'shopId') {
      // When selecting a shop, clear store
      const value = e.target.value ? parseInt(e.target.value) : '';
      setFormData({
        ...formData,
        shopId: value,
        storeId: '' // Clear store when shop is selected
      });
    } else if (e.target.name === 'quantity') {
      const value = parseInt(e.target.value, 10);
      setFormData({
        ...formData,
        quantity: Number.isNaN(value) ? 0 : value
      });
    } else {
      const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
      setFormData({
        ...formData,
        [e.target.name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter an item name');
      return;
    }
    if (!formData.company || formData.company === '') {
      alert('Please select a company');
      return;
    }
    
    setLoading(true);
    try {
      // Prepare data for API - convert empty strings to undefined and ensure proper types
      const submitData = {
        name: formData.name.trim(),
        company: formData.company ? parseInt(formData.company) : undefined,
        categories: Array.isArray(formData.categories) && formData.categories.length > 0 
          ? formData.categories.map(c => parseInt(c)) 
          : [],
        location: formData.location?.trim() || undefined,
        quantity: formData.quantity ?? 0,
        purchasePrice: formData.purchasePrice || 0,
        minimumSalePrice: formData.minimumSalePrice || 0
      };
      const pickedStoreId = showStoreSelect && formData.storeId ? parseInt(formData.storeId) : undefined;
      const pickedShopId = showShopSelect && formData.shopId ? parseInt(formData.shopId) : undefined;
      if (pickedStoreId) {
        submitData.storeId = pickedStoreId;
      } else if (pickedShopId) {
        submitData.shopId = pickedShopId;
      } else if (!showShopSelect && (selectedShop?.id || availableShops[0]?.id)) {
        submitData.shopId = selectedShop?.id || availableShops[0].id;
      } else if (!showStoreSelect && (selectedStore?.id || availableStores[0]?.id)) {
        submitData.storeId = selectedStore?.id || availableStores[0].id;
      }
      await itemsApi.create(submitData);
      navigate('/items');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
      setLoading(false);
    }
  };

  const companyOptions = companies.map(comp => ({ value: comp.id, label: comp.name }));
  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));

  return (
    <div>
      <Navigation />
      <FormWrapper title="Create Item" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Name" htmlFor="name" required>
            <Input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Company" htmlFor="company" required>
            <Input
              type="dropdown"
              name="company"
              placeholder="Select Company"
              value={formData.company}
              onChange={handleChange}
              options={companyOptions}
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Categories" htmlFor="categories">
            <Input
              type="dropdown"
              name="categories"
              placeholder="Select Categories"
              value={formData.categories}
              onChange={handleChange}
              options={categoryOptions}
              multiple={true}
            />
          </FormField>
          <FormField label="Location (optional)" htmlFor="location">
            <Input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
            />
          </FormField>
        </div>
        {(showStoreSelect || showShopSelect) && (
        <div className="form-fields-row">
          {showStoreSelect && (
          <FormField label="Store (optional)" htmlFor="storeId">
            <Input
              type="dropdown"
              name="storeId"
              placeholder="Select Store (optional)"
              value={formData.storeId}
              onChange={handleChange}
              options={availableStores.map(store => ({ value: store.id, label: store.name }))}
            />
          </FormField>
          )}
          {showShopSelect && (
          <FormField label="Shop (optional)" htmlFor="shopId">
            <Input
              type="dropdown"
              name="shopId"
              placeholder="Select Shop (optional)"
              value={formData.shopId}
              onChange={handleChange}
              options={availableShops.map(shop => ({ value: shop.id, label: shop.name }))}
            />
          </FormField>
          )}
        </div>
        )}
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
          <FormField label="Purchase Price (per unit)" htmlFor="purchasePrice" required>
            <Input
              type="number"
              name="purchasePrice"
              placeholder="Purchase Price (per unit)"
              value={formData.purchasePrice}
              onChange={handleChange}
              step="0.01"
            />
          </FormField>
        </div>
        <div className="form-fields-row">
          <FormField label="Minimum Sale Price" htmlFor="minimumSalePrice" required>
            <Input
              type="number"
              name="minimumSalePrice"
              placeholder="Minimum Sale Price"
              value={formData.minimumSalePrice}
              onChange={handleChange}
            />
          </FormField>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/items')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default ItemCreate;

