import React from 'react';
import './FormWrapper.css';

const FormWrapper = ({ title, children, onSubmit }) => {
  return (
    <div className="form-wrapper-container">
      <div className="form-wrapper-box">
        {title && <h2 className="form-wrapper-title">{title}</h2>}
        <form onSubmit={onSubmit} className="form-wrapper-form">
          {children}
        </form>
      </div>
    </div>
  );
};

export default FormWrapper;

