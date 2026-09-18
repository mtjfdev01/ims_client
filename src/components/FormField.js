import React from 'react';
import './FormField.css';

const FormField = ({ label, children, htmlFor, required = false }) => {
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }
    const extra = {};
    if (htmlFor && child.props.id == null) {
      extra.id = htmlFor;
    }
    if (required && child.props.required == null) {
      extra.required = true;
    }
    if (Object.keys(extra).length === 0) {
      return child;
    }
    return React.cloneElement(child, extra);
  });

  return (
    <div className="form-field">
      <label htmlFor={htmlFor} className="form-field-label">
        {label}
        {required && <span className="required-asterisk" aria-hidden="true"> *</span>}:
      </label>
      <div className="form-field-input">
        {enhancedChildren}
      </div>
    </div>
  );
};

export default FormField;
