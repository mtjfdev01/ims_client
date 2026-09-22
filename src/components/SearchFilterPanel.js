import React, { useEffect, useState } from 'react';
import FilterActions from './FilterActions';
import './FilterPanel.css';

const SearchFilterPanel = ({ onFilterChange, onClear, currentFilters = {}, placeholder = 'Search...' }) => {
  const [search, setSearch] = useState(currentFilters.search || '');

  useEffect(() => {
    setSearch(currentFilters.search || '');
  }, [currentFilters.search]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    onFilterChange({ search: value });
  };

  const handleClear = () => {
    setSearch('');
    if (onClear) {
      onClear();
    } else {
      onFilterChange({ search: '' });
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
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={search}
              onChange={handleChange}
              placeholder={placeholder}
              className="filter-input"
            />
          </div>
        </div>
        <FilterActions onClear={handleClear} />
      </div>
    </div>
  );
};

export default SearchFilterPanel;
