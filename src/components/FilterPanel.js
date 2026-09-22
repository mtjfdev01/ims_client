import React, { useEffect, useState } from 'react';
import FilterActions from './FilterActions';
import './FilterPanel.css';

const emptyFilters = {
  date: '',
  dateFrom: '',
  dateTo: '',
  search: '',
};

const FilterPanel = ({ onFilterChange, onApplyFilters, onClear, currentFilters = {}, searchPlaceholder = 'Search...' }) => {
  const applyFilters = onFilterChange || onApplyFilters;
  const [filters, setFilters] = useState({ ...emptyFilters, ...currentFilters });

  useEffect(() => {
    setFilters({ ...emptyFilters, ...currentFilters });
  }, [currentFilters.date, currentFilters.dateFrom, currentFilters.dateTo, currentFilters.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value,
    };

    if (name === 'date' && value) {
      newFilters.dateFrom = '';
      newFilters.dateTo = '';
    }
    if ((name === 'dateFrom' || name === 'dateTo') && (newFilters.dateFrom || newFilters.dateTo)) {
      newFilters.date = '';
    }

    setFilters(newFilters);
    if (applyFilters) {
      applyFilters(newFilters);
    }
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
          <div className="filter-field">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder={searchPlaceholder}
              className="filter-input"
            />
          </div>
        </div>
        <FilterActions onClear={handleClear} />
      </div>
    </div>
  );
};

export default FilterPanel;
