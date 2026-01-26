import React from 'react';
import './FormField.css';

const FormField = ({ label, children, htmlFor }) => {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor} className="form-field-label">
        {label}:
      </label>
      <div className="form-field-input">
        {children}
      </div>
    </div>
  );
};

export default FormField;
