import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { defaultHomePath, hasPermission } from '../services/session';
import '../pages/shops/ShopList.css';

const RequireShop = ({ children, block = false }) => {
  const { selectedShop } = useShop();
  const navigate = useNavigate();

  if (!selectedShop && block) {
    return (
      <div className="listing-container">
        <div className="selected-shop-banner" style={{ backgroundColor: '#c0392b' }}>
          <span>Select a shop before creating shop-scoped records.</span>
          <button
            onClick={() => navigate(hasPermission('shops') ? '/shops' : defaultHomePath())}
            className="clear-shop-btn"
          >
            {hasPermission('shops') ? 'Go to Shops' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedShop && (
        <div className="selected-shop-banner">
          <span>Working in shop: <strong>{selectedShop.name}</strong></span>
        </div>
      )}
      {children}
    </>
  );
};

export default RequireShop;
