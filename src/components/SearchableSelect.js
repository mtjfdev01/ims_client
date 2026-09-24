import React, { useEffect, useRef, useState } from 'react';
import './Input.css';
import './SearchableSelect.css';

const SearchableSelect = ({
  name,
  id,
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  fetchOptions,
  fetchSelected,
  selectedLabel,
  emptyOption,
  debounceMs = 300,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const requestId = useRef(0);
  const selectedRef = useRef(null);

  selectedRef.current = selected;

  useEffect(() => {
    const onClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const current = selectedRef.current;

    if (!value) {
      setSelected(null);
      return undefined;
    }

    if (current && String(current.value) === String(value) && current.label) {
      if (selectedLabel && current.label !== selectedLabel) {
        setSelected({ value, label: selectedLabel });
      }
      return undefined;
    }

    if (selectedLabel) {
      setSelected({ value, label: selectedLabel });
      return undefined;
    }

    if (!fetchSelected) {
      return undefined;
    }

    const loadSelected = async () => {
      try {
        const option = await fetchSelected(value);
        if (!cancelled && option) {
          setSelected(option);
        }
      } catch (error) {
        if (!cancelled) {
          setSelected(null);
        }
      }
    };
    loadSelected();
    return () => {
      cancelled = true;
    };
  }, [value, selectedLabel, fetchSelected]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const delay = query.trim() ? debounceMs : 0;
    const handle = setTimeout(async () => {
      const current = ++requestId.current;
      setLoading(true);
      try {
        const rows = await fetchOptions(query.trim());
        if (requestId.current === current) {
          setOptions(Array.isArray(rows) ? rows : []);
        }
      } catch (error) {
        if (requestId.current === current) {
          setOptions([]);
        }
      } finally {
        if (requestId.current === current) {
          setLoading(false);
        }
      }
    }, delay);
    return () => clearTimeout(handle);
  }, [open, query, fetchOptions, debounceMs]);

  const emit = (nextValue) => {
    if (onChange) {
      onChange({ target: { name, value: nextValue } });
    }
  };

  const handleSelect = (option) => {
    const next = option.value === ''
      ? null
      : { ...option, label: option.selectedLabel || option.label };
    setSelected(next);
    emit(option.value);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setSelected(null);
    emit('');
    setQuery('');
    setOpen(true);
    inputRef.current?.focus();
  };

  const display = open ? query : (selected?.label || '');

  return (
    <div className="dropdown-container searchable-select" ref={wrapRef}>
      <div className={`searchable-select-field ${open ? 'open' : ''} ${disabled ? 'disabled' : ''}`}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="searchable-select-input"
          name={name}
          value={display}
          placeholder={selected?.label || placeholder}
          disabled={disabled}
          autoComplete="off"
          onFocus={() => {
            if (!disabled) {
              setOpen(true);
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (options[0]) {
                handleSelect(options[0]);
              }
            }
            if (e.key === 'Escape') {
              setOpen(false);
              setQuery('');
            }
          }}
        />
        {value && !disabled && (
          <button type="button" className="searchable-select-clear" onClick={handleClear} aria-label="Clear">
            ×
          </button>
        )}
        <span className="dropdown-arrow">▼</span>
      </div>
      {open && !disabled && (
        <div className="dropdown-menu">
          {emptyOption && !query.trim() && (
            <div
              className={`dropdown-option ${!value ? 'selected' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(emptyOption)}
            >
              {emptyOption.label}
            </div>
          )}
          {loading && options.length === 0 && (
            <div className="dropdown-option no-options">Searching...</div>
          )}
          {!loading && options.length === 0 && (
            <div className="dropdown-option no-options">No matches</div>
          )}
          {options.map((option) => (
            <div
              key={String(option.value)}
              className={`dropdown-option ${String(option.value) === String(value) ? 'selected' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
