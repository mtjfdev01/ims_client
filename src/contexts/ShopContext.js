import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [selectedShop, setSelectedShop] = useState(null);

  // Load selected shop from localStorage on mount
  useEffect(() => {
    const savedShop = localStorage.getItem('selectedShop');
    if (savedShop) {
      try {
        setSelectedShop(JSON.parse(savedShop));
      } catch (e) {
        console.error('Error parsing selected shop from localStorage:', e);
      }
    }
  }, []);

  // Save selected shop to localStorage whenever it changes
  useEffect(() => {
    if (selectedShop) {
      localStorage.setItem('selectedShop', JSON.stringify(selectedShop));
    } else {
      localStorage.removeItem('selectedShop');
    }
  }, [selectedShop]);

  const selectShop = (shop) => {
    setSelectedShop(shop);
  };

  const clearShop = () => {
    setSelectedShop(null);
  };

  return (
    <ShopContext.Provider value={{ selectedShop, selectShop, clearShop }}>
      {children}
    </ShopContext.Provider>
  );
};
