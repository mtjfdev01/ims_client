import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { shopsApi, storesApi } from '../services/api';
import './ContextBreadcrumb.css';

const ContextBreadcrumb = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContext();
  }, [location.pathname, params.id]);

  const loadContext = async () => {
    setLoading(true);
    try {
      // Check if we're viewing a shop
      if (params.id && location.pathname.includes('/shops/')) {
        const shop = await shopsApi.getOne(params.id);
        if (shop) {
          setContext({
            type: 'shop',
            id: shop.id,
            name: shop.name,
            branch: shop.branch,
            path: `/shops/${shop.id}`
          });
        }
      }
      // Check if we're viewing a store
      else if (params.id && location.pathname.includes('/stores/')) {
        const store = await storesApi.getOne(params.id);
        if (store) {
          setContext({
            type: 'store',
            id: store.id,
            name: store.name,
            path: `/stores/${store.id}`
          });
        }
      } else {
        setContext(null);
      }
    } catch (error) {
      console.error('Error loading context:', error);
      setContext(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !context) {
    return null;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/items')) return 'Items';
    if (path.includes('/sales')) return 'Sales';
    if (path.includes('/expenses')) return 'Expenses';
    return null;
  };

  const pageTitle = getPageTitle();

  return (
    <div className="context-breadcrumb">
      <div className="context-info">
        <span className="context-label">
          {context.type === 'shop' ? '🏪 Shop' : '📦 Store'}:
        </span>
        <button 
          className="context-name"
          onClick={() => navigate(context.path)}
        >
          {context.type === 'shop' ? `${context.name} (${context.branch})` : context.name}
        </button>
        {pageTitle && (
          <>
            <span className="context-separator">›</span>
            <span className="context-page">{pageTitle}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ContextBreadcrumb;
