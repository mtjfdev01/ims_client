import React from 'react';
import useCollapsibleOnMobile from './useCollapsibleOnMobile';
import './CollapsibleFilters.css';

const CollapsibleFilters = ({ title = 'Filters', children }) => {
  const { isMobile, open, toggle } = useCollapsibleOnMobile();

  return (
    <div className={`collapsible-filters${open ? ' is-open' : ' is-collapsed'}`}>
      {isMobile && (
        <button
          type="button"
          className="collapsible-filters-toggle"
          onClick={toggle}
          aria-expanded={open}
        >
          <span>{title}</span>
          <span className="collapsible-filters-toggle-label">{open ? 'Hide' : 'Show'}</span>
        </button>
      )}
      <div className="collapsible-filters-body">
        {children}
      </div>
    </div>
  );
};

export default CollapsibleFilters;
