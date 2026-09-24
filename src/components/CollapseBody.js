import React from 'react';
import './CollapseBody.css';

const CollapseBody = ({ open, children, className = '' }) => (
  <div
    className={`collapse-body${open ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
    aria-hidden={!open}
  >
    <div className="collapse-body-inner">
      {children}
    </div>
  </div>
);

export default CollapseBody;
