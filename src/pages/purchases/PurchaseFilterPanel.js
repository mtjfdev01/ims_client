import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import FilterActions from '../../components/FilterActions';
import { itemsApi } from '../../services/api';
import './PurchaseFilterPanel.css';

const emptyFilters = {
  date: '',
  dateFrom: '',
  dateTo: '',
  itemId: '',
};

const PurchaseFilterPanel = ({ onApplyFilters, onFilterChange, onClear, currentFilters = {} }) => {
  const applyFilters = onFilterChange || onApplyFilters;
  const [filters, setFilters] = useState({ ...emptyFilters, ...currentFilters });
  const [items, setItems] = useState([]);

  useEffect(() => {
    setFilters({ ...emptyFilters, ...currentFilters });
  }, [currentFilters.date, currentFilters.dateFrom, currentFilters.dateTo, currentFilters.itemId]);

  useEffect(() => {
    itemsApi.getAll()
      .then((data) => setItems(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => setItems([]));
  }, []);

  const emit = (next) => {
    setFilters(next);
    if (applyFilters) {
      applyFilters(next);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...filters, [name]: value };
    if (name === 'date' && value) {
      next.dateFrom = '';
      next.dateTo = '';
    }
    if ((name === 'dateFrom' || name === 'dateTo') && (next.dateFrom || next.dateTo)) {
      next.date = '';
    }
    emit(next);
  };

  const handleClear = () => {
    setFilters(emptyFilters);
    if (onClear) {
      onClear();
    } else if (applyFilters) {
      applyFilters(emptyFilters);
    }
  };

  const itemOptions = items.map((item) => ({
    value: item.id,
    label: item.name ? `${item.name} (ID: ${item.id})` : `Item #${item.id}`,
  }));

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters</h3>
      </div>
      <div className="filter-panel-body">
        <div className="filter-row">
          <div className="filter-field">
            <label htmlFor="itemId">Item:</label>
            <Input
              type="dropdown"
              name="itemId"
              value={filters.itemId}
              onChange={handleChange}
              options={[{ value: '', label: 'All Items' }, ...itemOptions]}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="date">Specific Date:</label>
            <Input type="date" name="date" value={filters.date} onChange={handleChange} />
          </div>
          <div className="filter-field">
            <label htmlFor="dateFrom">Date From:</label>
            <Input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} />
          </div>
          <div className="filter-field">
            <label htmlFor="dateTo">Date To:</label>
            <Input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} />
          </div>
        </div>
        <FilterActions onClear={handleClear} />
      </div>
    </div>
  );
};

export default PurchaseFilterPanel;
