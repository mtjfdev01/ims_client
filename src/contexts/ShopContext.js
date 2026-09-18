import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopsApi } from '../services/api';
import { getAssignedShops, getUser, hasSingleAssignedShop, isSuperAdmin, isTenantAdmin } from '../services/session';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

const STORE_KEY = 'selectedStore';

const readStored = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage:`, e);
    return null;
  }
};

export const ShopProvider = ({ children }) => {
  const [selectedShop, setSelectedShop] = useState(() => readStored('selectedShop'));
  const [selectedStore, setSelectedStore] = useState(() => readStored(STORE_KEY));
  const [shopStores, setShopStores] = useState(null);

  useEffect(() => {
    const syncAssignedShop = () => {
      const user = getUser();
      if (!user) {
        setSelectedShop(null);
        setSelectedStore(null);
        setShopStores([]);
        return;
      }
      if (isSuperAdmin(user)) {
        return;
      }
      const assigned = getAssignedShops(user);
      if (hasSingleAssignedShop(user)) {
        const onlyShop = assigned[0];
        setSelectedShop(prev => (prev?.id === onlyShop.id ? prev : onlyShop));
        return;
      }
      const allowedIds = assigned.map(shop => shop.id);
      setSelectedShop(prev => {
        if (prev && allowedIds.length && !allowedIds.includes(prev.id)) {
          return null;
        }
        return prev;
      });
    };

    window.addEventListener('ims-session', syncAssignedShop);
    syncAssignedShop();
    return () => window.removeEventListener('ims-session', syncAssignedShop);
  }, []);

  useEffect(() => {
    if (selectedShop) {
      localStorage.setItem('selectedShop', JSON.stringify(selectedShop));
    } else {
      localStorage.removeItem('selectedShop');
    }
  }, [selectedShop]);

  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem(STORE_KEY, JSON.stringify(selectedStore));
    } else {
      localStorage.removeItem(STORE_KEY);
    }
  }, [selectedStore]);

  useEffect(() => {
    const user = getUser();
    if (!user || isSuperAdmin(user) || isTenantAdmin(user) || !selectedShop?.id) {
      if (!selectedShop?.id && user?.role === 'user') {
        setShopStores([]);
        setSelectedStore(null);
      }
      return;
    }

    let cancelled = false;
    shopsApi.getOne(selectedShop.id).then((shop) => {
      if (cancelled) {
        return;
      }
      const stores = Array.isArray(shop?.stores) ? shop.stores.filter(store => !store.is_archived) : [];
      setShopStores(stores);
      if (stores.length === 1) {
        setSelectedStore(stores[0]);
      } else if (stores.length === 0) {
        setSelectedStore(null);
      } else {
        setSelectedStore(prev => (prev && stores.some(store => store.id === prev.id) ? prev : null));
      }
    }).catch(() => {
      if (!cancelled) {
        setShopStores([]);
        setSelectedStore(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedShop]);

  const selectShop = (shop) => {
    setSelectedShop(shop);
  };

  const clearShop = () => {
    if (hasSingleAssignedShop()) {
      return;
    }
    setSelectedShop(null);
    setSelectedStore(null);
    setShopStores([]);
  };

  const selectStore = (store) => {
    setSelectedStore(store);
  };

  const clearStore = () => {
    if ((shopStores || []).length === 1) {
      return;
    }
    setSelectedStore(null);
  };

  const hideStoresNav = getUser()?.role === 'user' && (!Array.isArray(shopStores) || shopStores.length < 2);

  return (
    <ShopContext.Provider value={{
      selectedShop,
      selectShop,
      clearShop,
      selectedStore,
      selectStore,
      clearStore,
      shopStores,
      hideStoresNav,
    }}>
      {children}
    </ShopContext.Provider>
  );
};
