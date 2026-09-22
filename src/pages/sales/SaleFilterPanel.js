import React, { useEffect, useState } from 'react';
import FilterActions from '../../components/FilterActions';
import '../../components/FilterPanel.css';
import { PAYMENT_LABELS } from './salePayment';

const emptyFilters = {
  date: '',
  dateFrom: '',
  dateTo: '',
  search: '',
  paymentStatus: '',
  dueToday: '',
};

const SaleFilterPanel = ({ onFilterChange, onClear, currentFilters = {} }) => {
  const [filters, setFilters] = useState({ ...emptyFilters, ...currentFilters });

  useEffect(() => {
    setFilters({ ...emptyFilters, ...currentFilters });
  }, [
    currentFilters.date,
    currentFilters.dateFrom,
    currentFilters.dateTo,
    currentFilters.search,
    currentFilters.paymentStatus,
    currentFilters.dueToday,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? (checked ? 'true' : '') : value;
    const newFilters = { ...filters, [name]: nextValue };
    if (name === 'date' && nextValue) {
      newFilters.dateFrom = '';
      newFilters.dateTo = '';
    }
    if ((name === 'dateFrom' || name === 'dateTo') && (newFilters.dateFrom || newFilters.dateTo)) {
      newFilters.date = '';
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setFilters(emptyFilters);
    if (onClear) {
      onClear();
    } else {
      onFilterChange(emptyFilters);
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
            <label htmlFor="paymentStatus">Payment:</label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleChange}
              className="filter-input"
            >
              <option value="">All</option>
              {Object.entries(PAYMENT_LABELS).map(([status, label]) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="dueToday" className="filter-checkbox-label">
              <input
                type="checkbox"
                id="dueToday"
                name="dueToday"
                checked={filters.dueToday === 'true'}
                onChange={handleChange}
              />
              Due today
            </label>
          </div>
          <div className="filter-field">
            <label htmlFor="search">Customer:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Name or phone"
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="date">Single Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={filters.date}
              onChange={handleChange}
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="dateFrom">Date From:</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="dateTo">Date To:</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
              className="filter-input"
            />
          </div>
        </div>
        <FilterActions onClear={handleClear} />
      </div>
    </div>
  );
};

export default SaleFilterPanel;
