import React, { useEffect, useMemo, useState } from 'react';
import { userPermissionsApi } from '../services/api';
import { mergeModuleCatalog } from '../services/appModules';
import { getUser, updateStoredUser } from '../services/session';
import './PermissionsModal.css';

const PermissionsIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2 4 5v6c0 5.2 3.4 10 8 11.2C16.6 21 20 16.2 20 11V5l-8-3zm0 2.2 6 2.2V11c0 4.1-2.6 8-6 9.1-3.4-1.1-6-5-6-9.1V6.4l6-2.2zm-1.1 11.2-2.8-2.8 1.2-1.2 1.6 1.6 3.8-3.8 1.2 1.2-5 5z"
    />
  </svg>
);

export const PermissionsIconButton = ({ onClick, label = 'Manage permissions', count }) => (
  <button type="button" className="permissions-icon-btn" onClick={onClick} title={label} aria-label={label}>
    <PermissionsIcon />
    {typeof count === 'number' && <span className="permissions-icon-count">{count}</span>}
  </button>
);

const PermissionsModal = ({ user, catalog: catalogProp, onClose, onSaved }) => {
  const [catalog, setCatalog] = useState(mergeModuleCatalog(catalogProp || []));
  const [selected, setSelected] = useState([...(user.permissions || [])]);
  const [original, setOriginal] = useState([...(user.permissions || [])]);
  const [loading, setLoading] = useState(!catalogProp || !user.permissions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    if (catalogProp && Array.isArray(user.permissions)) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await userPermissionsApi.list(user.tenant?.id);
        if (cancelled) {
          return;
        }
        const modules = mergeModuleCatalog(result.modules || catalogProp || []);
        const match = (result.users || []).find((row) => String(row.id) === String(user.id));
        const modulesForUser = match?.permissions || user.permissions || [];
        setCatalog(modules);
        setSelected([...modulesForUser]);
        setOriginal([...modulesForUser]);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load permissions');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [catalogProp, user]);

  const dirty = useMemo(() => {
    const a = [...original].sort().join(',');
    const b = [...selected].sort().join(',');
    return a !== b;
  }, [original, selected]);

  const toggleModule = (moduleKey) => {
    setSelected((prev) => (
      prev.includes(moduleKey)
        ? prev.filter((key) => key !== moduleKey)
        : [...prev, moduleKey]
    ));
    setError('');
  };

  const setAll = (enabled) => {
    setSelected(enabled ? catalog.map((module) => module.key) : []);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await userPermissionsApi.set(user.id, selected);
      const current = getUser();
      if (current && String(current.id) === String(user.id)) {
        updateStoredUser({ ...current, permissions: updated.permissions });
      }
      if (onSaved) {
        onSaved(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user.role === 'tenant_admin' ? 'Organization admin' : 'Shop user';

  return (
    <div className="permissions-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="permissions-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permissions-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="permissions-modal-header">
          <div>
            <h2 id="permissions-modal-title">Permissions</h2>
            <p className="permissions-modal-user">
              <strong>{user.name}</strong>
              {user.email ? ` · ${user.email}` : ''}
            </p>
            <p className="permissions-modal-meta">
              {roleLabel}
              {user.tenant?.name ? ` · ${user.tenant.name}` : ''}
            </p>
          </div>
          <button type="button" className="permissions-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="permissions-modal-error">{error}</div>}

        {loading ? (
          <p className="permissions-modal-loading">Loading modules...</p>
        ) : (
          <div className="permissions-modal-grid">
            {catalog.map((module) => (
              <label key={module.key} className="permissions-modal-item">
                <input
                  type="checkbox"
                  checked={selected.includes(module.key)}
                  onChange={() => toggleModule(module.key)}
                />
                <span>{module.label}</span>
              </label>
            ))}
          </div>
        )}

        <div className="permissions-modal-actions">
          <button type="button" className="permissions-modal-secondary" onClick={() => setAll(true)} disabled={loading}>
            All
          </button>
          <button type="button" className="permissions-modal-secondary" onClick={() => setAll(false)} disabled={loading}>
            None
          </button>
          <div className="permissions-modal-actions-end">
            <button type="button" className="permissions-modal-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="permissions-modal-primary"
              onClick={handleSave}
              disabled={loading || saving || !dirty}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;
