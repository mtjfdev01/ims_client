import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import { itemsApi } from '../../services/api';
import './PurchaseFilterPanel.css';

const PurchaseFilterPanel = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    date: '',
    dateFrom: '',
    dateTo: '',
    itemId: '',
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await itemsApi.getAll();
      const itemsArray = Array.isArray(data) ? data : (data.data || []);
      setItems(itemsArray);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    const appliedFilters = {};
    if (filters.itemId) appliedFilters.itemId = filters.itemId;
    if (filters.date) appliedFilters.date = filters.date;
    if (filters.dateFrom) appliedFilters.dateFrom = filters.dateFrom;
    if (filters.dateTo) appliedFilters.dateTo = filters.dateTo;
    onApplyFilters(appliedFilters);
  };

  const handleClear = () => {
    setFilters({ date: '', dateFrom: '', dateTo: '', itemId: '' });
    onApplyFilters({});
  };

  const itemOptions = items.map(item => ({
    value: item.id,
    label: item.name ? `${item.name} (ID: ${item.id})` : `Item #${item.id}`
  }));

  return (
    <div className="purchase-filter-panel">
      <div className="filter-group">
        <label htmlFor="itemId">Item:</label>
        <Input
          type="dropdown"
          name="itemId"
          value={filters.itemId}
          onChange={handleChange}
          options={[{ value: '', label: 'All Items' }, ...itemOptions]}
        />
      </div>
      <div className="filter-group">
        <label htmlFor="date">Specific Date:</label>
        <Input type="date" name="date" value={filters.date} onChange={handleChange} />
      </div>
      <div className="filter-group">
        <label htmlFor="dateFrom">Date From:</label>
        <Input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} />
      </div>
      <div className="filter-group">
        <label htmlFor="dateTo">Date To:</label>
        <Input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} />
      </div>
      <div className="filter-actions">
        <button onClick={handleApply} className="filter-button filter-button-primary">Apply Filters</button>
        <button onClick={handleClear} className="filter-button filter-button-secondary">Clear Filters</button>
      </div>
    </div>
  );
};

export default PurchaseFilterPanel;
