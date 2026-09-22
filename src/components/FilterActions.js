import React from 'react';
import './FilterPanel.css';

const FilterActions = ({ onClear }) => (
  <div className="filter-panel-footer">
    <button type="button" onClick={onClear} className="filter-clear-button">
      Clear
    </button>
  </div>
);

export default FilterActions;
