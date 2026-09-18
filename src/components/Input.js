import React, { useState, useRef, useEffect } from 'react';
import './Input.css';

export const EyeIcon = ({ off }) => (
  off ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M12 5c5.5 0 9.5 4.5 10.5 6-.4.6-1.5 2-3.3 3.4l1.4 1.4-1.1 1.1-14-14L6.6 1.8l2.2 2.2C9.7 3.4 10.8 3.1 12 3.1zm0 3.2c-.4 0-.7.1-1 .2l1.6 1.6c.7.1 1.3.7 1.4 1.4l1.6 1.6c.1-.3.2-.6.2-1C15.8 9.3 14.1 7.6 12 7.6zM3.4 5.1l2 2C3.7 8.5 2.5 10.2 2 11c1 1.5 5 6.9 10 6.9 1.4 0 2.7-.3 3.9-.8l2.3 2.3 1.1-1.1-14-14-1.9 1.8zM8.2 9.9l1.5 1.5c.1.8.7 1.4 1.5 1.5l1.5 1.5c-.3.1-.6.1-1 .1-2.1 0-3.8-1.7-3.8-3.8 0-.3 0-.6.1-.8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M12 5c-5 0-9 4.5-10 6 1 1.5 5 6 10 6s9-4.5 10-6c-1-1.5-5-6-10-6zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2.2A1.8 1.8 0 1 0 12 9a1.8 1.8 0 0 0 0 3.6z" />
    </svg>
  )
);

const Input = ({ type, name, id, onChange, placeholder, value, options, multiple, disabled, min, max, step, required, minLength }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (type === 'dropdown') {
    if (multiple) {
      const selectedValues = Array.isArray(value) ? value.map(v => String(v)) : [];
      
      const handleOptionToggle = (optionValue) => {
        const stringValue = String(optionValue);
        const newSelected = selectedValues.includes(stringValue)
          ? selectedValues.filter(v => v !== stringValue)
          : [...selectedValues, stringValue];
        
        // Convert to numbers if original values were numbers
        const numericValues = newSelected.map(v => {
          const option = options.find(opt => String(typeof opt === 'object' ? opt.value : opt) === v);
          return option && typeof option === 'object' ? option.value : (isNaN(Number(v)) ? v : Number(v));
        });
        
        // Create a synthetic event that mimics the native select element
        const syntheticEvent = {
          target: {
            name: name,
            selectedOptions: numericValues.map(val => ({ value: val })),
            value: numericValues // Also provide value for compatibility
          }
        };
        
        onChange(syntheticEvent);
      };

      const getSelectedLabels = () => {
        if (selectedValues.length === 0) {
          return placeholder || 'Select...';
        }
        if (selectedValues.length === 1) {
          const option = options.find(opt => String(typeof opt === 'object' ? opt.value : opt) === selectedValues[0]);
          return typeof option === 'object' ? option.label : option;
        }
        return `${selectedValues.length} selected`;
      };

      return (
        <div className="dropdown-container" id={id} ref={dropdownRef}>
          <div
            className={`dropdown-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={selectedValues.length === 0 ? 'placeholder' : ''}>
              {getSelectedLabels()}
            </span>
            <span className="dropdown-arrow">▼</span>
          </div>
          {isOpen && !disabled && (
            <div className="dropdown-menu">
              {options && options.length > 0 ? (
                options.map((option, index) => {
                  const optionValue = typeof option === 'object' ? option.value : option;
                  const optionLabel = typeof option === 'object' ? option.label : option;
                  const isSelected = selectedValues.includes(String(optionValue));
                  
                  return (
                    <div
                      key={index}
                      className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleOptionToggle(optionValue)}
                    >
                      <span className="checkbox">{isSelected ? '✓' : ''}</span>
                      <span>{optionLabel}</span>
                    </div>
                  );
                })
              ) : (
                <div className="dropdown-option no-options">No options available</div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Single select dropdown
    const selectedOption = options?.find(opt => {
      const optValue = typeof opt === 'object' ? opt.value : opt;
      return String(optValue) === String(value);
    });
    const displayValue = selectedOption 
      ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
      : (placeholder || 'Select...');

    return (
      <div className="dropdown-container" id={id} ref={dropdownRef}>
        <div
          className={`dropdown-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={!value ? 'placeholder' : ''}>{displayValue}</span>
          <span className="dropdown-arrow">▼</span>
        </div>
        {isOpen && !disabled && (
          <div className="dropdown-menu">
            {options && options.length > 0 ? (
              <>
                {!value && (
                  <div
                    className="dropdown-option"
                    onClick={() => {
                      const syntheticEvent = {
                        target: { name, value: '' }
                      };
                      onChange(syntheticEvent);
                      setIsOpen(false);
                    }}
                  >
                    {placeholder || 'Select...'}
                  </div>
                )}
                {options.map((option, index) => {
                  const optionValue = typeof option === 'object' ? option.value : option;
                  const optionLabel = typeof option === 'object' ? option.label : option;
                  const isSelected = String(optionValue) === String(value);
                  
                  return (
                    <div
                      key={index}
                      className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        const syntheticEvent = {
                          target: { name, value: optionValue }
                        };
                        onChange(syntheticEvent);
                        setIsOpen(false);
                      }}
                    >
                      {optionLabel}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="dropdown-option no-options">No options available</div>
            )}
          </div>
        )}
      </div>
    );
  }

  const input = (
    <input
      type={type === 'password' && showPassword ? 'text' : type}
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      value={value !== undefined && value !== null ? value : ''}
      className="common-input"
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      required={required}
      minLength={minLength}
    />
  );

  if (type !== 'password') {
    return input;
  }

  return (
    <div className="password-input-wrap">
      {input}
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(prev => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        <EyeIcon off={showPassword} />
      </button>
    </div>
  );
};

export default Input;

