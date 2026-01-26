import React, { useState } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ onFilterChange, onClear }) => {
  const [filters, setFilters] = useState({
    date: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    // If single date is selected, clear date range
    if (name === 'date' && value) {
      newFilters.dateFrom = '';
      newFilters.dateTo = '';
    }
    // If date range is selected, clear single date
    if ((name === 'dateFrom' || name === 'dateTo') && (newFilters.dateFrom || newFilters.dateTo)) {
      newFilters.date = '';
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      date: '',
      dateFrom: '',
      dateTo: '',
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
              placeholder="Search..."
              className="filter-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
