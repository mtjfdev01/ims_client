import React, { useState } from 'react';
import CollapseBody from './CollapseBody';
import './InlineCreatePanel.css';

const InlineCreatePanel = ({ title = 'Add new', children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`inline-create-panel${open ? ' is-open' : ' is-collapsed'}`}>
      <button
        type="button"
        className="inline-create-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="inline-create-toggle-label">{open ? 'Hide' : 'Show'}</span>
      </button>
      <CollapseBody open={open} className="inline-create-body">
        {children}
      </CollapseBody>
    </div>
  );
};

export default InlineCreatePanel;
