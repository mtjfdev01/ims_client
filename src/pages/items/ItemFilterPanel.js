import React, { useState, useEffect } from 'react';
import './ItemFilterPanel.css';

const ItemFilterPanel = ({ onFilterChange, onClear, currentFilters = {} }) => {
  const [filters, setFilters] = useState({
    filterType: currentFilters.filterType || '', // 'store' or 'shop' or ''
    search: currentFilters.search || ''
  });

  // Update local state when currentFilters prop changes
  useEffect(() => {
    setFilters({
      filterType: currentFilters.filterType || '',
      search: currentFilters.search || ''
    });
  }, [currentFilters.filterType, currentFilters.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      filterType: '',
      search: ''
    };
    setFilters(clearedFilters);
    onClear();
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters</h3>
        <button onClick={handleClear} className="filter-clear-button">Clear All</button>
      </div>
      <div className="filter-panel-body">
        <div className="filter-row">
          <div className="filter-field">
            <label htmlFor="filterType">Filter by Type:</label>
            <select
              id="filterType"
              name="filterType"
              value={filters.filterType}
              onChange={handleChange}
              className="filter-input"
            >
              <option value="">All Items</option>
              <option value="store">Store Items Only</option>
              <option value="shop">Shop Items Only</option>
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search by name..."
              className="filter-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemFilterPanel;
