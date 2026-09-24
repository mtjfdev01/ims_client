import React, { useState } from 'react';
import CollapseBody from './CollapseBody';
import './CollapsibleFilters.css';

const CollapsibleFilters = ({ title = 'Filters', children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`collapsible-filters${open ? ' is-open' : ' is-collapsed'}`}>
      <button
        type="button"
        className="collapsible-filters-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="collapsible-filters-toggle-label">{open ? 'Hide' : 'Show'}</span>
      </button>
      <CollapseBody open={open} className="collapsible-filters-body">
        {children}
      </CollapseBody>
    </div>
  );
};

export default CollapsibleFilters;
