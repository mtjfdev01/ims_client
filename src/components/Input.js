import React, { useState, useRef, useEffect } from 'react';
import './Input.css';

const Input = ({ type, name, onChange, placeholder, value, options, multiple, disabled, min, max, step }) => {
  const [isOpen, setIsOpen] = useState(false);
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
        <div className="dropdown-container" ref={dropdownRef}>
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
      <div className="dropdown-container" ref={dropdownRef}>
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

  return (
    <input
      type={type}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      value={value !== undefined && value !== null ? value : ''}
      className="common-input"
      disabled={disabled}
      min={min}
      max={max}
      step={step}
    />
  );
};

export default Input;

