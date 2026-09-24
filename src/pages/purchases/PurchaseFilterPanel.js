import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import FilterActions from '../../components/FilterActions';
import { ItemSearchSelect, SellerSearchSelect } from '../../components/entitySearchSelects';
import { hasPermission } from '../../services/session';
import { ITEM_CONDITIONS } from '../items/itemCondition';
import './PurchaseFilterPanel.css';

const emptyFilters = {
  date: '',
  dateFrom: '',
  dateTo: '',
  itemId: '',
  sellerId: '',
  condition: '',
};

const PurchaseFilterPanel = ({ onApplyFilters, onFilterChange, onClear, currentFilters = {} }) => {
  const applyFilters = onFilterChange || onApplyFilters;
  const [filters, setFilters] = useState({ ...emptyFilters, ...currentFilters });
  const canUseSellers = hasPermission('sellers');

  useEffect(() => {
    setFilters({ ...emptyFilters, ...currentFilters });
  }, [currentFilters.date, currentFilters.dateFrom, currentFilters.dateTo, currentFilters.itemId, currentFilters.sellerId, currentFilters.condition]);

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

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters</h3>
      </div>
      <div className="filter-panel-body">
        <div className="filter-row">
          <div className="filter-field">
            <label htmlFor="itemId">Item:</label>
            <ItemSearchSelect
              id="itemId"
              name="itemId"
              shopOnly
              placeholder="Search item"
              emptyOption={{ value: '', label: 'All Items' }}
              value={filters.itemId}
              onChange={handleChange}
            />
          </div>
          {canUseSellers && (
            <div className="filter-field">
              <label htmlFor="sellerId">Seller:</label>
              <SellerSearchSelect
                id="sellerId"
                name="sellerId"
                placeholder="Search seller"
                emptyOption={{ value: '', label: 'All Sellers' }}
                value={filters.sellerId}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="filter-field">
            <label htmlFor="condition">Condition:</label>
            <select
              id="condition"
              name="condition"
              value={filters.condition}
              onChange={handleChange}
              className="filter-input"
            >
              <option value="">All items</option>
              <option value="second_hand">Second-hand only</option>
              {ITEM_CONDITIONS.map((entry) => (
                <option key={entry.value} value={entry.value}>{entry.label}</option>
              ))}
            </select>
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
