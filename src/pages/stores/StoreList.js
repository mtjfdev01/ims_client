import React from 'react';
import { Navigate } from 'react-router-dom';
import Listing from '../../components/Listing';
import { storesApi, unwrapList } from '../../services/api';
import { useShop } from '../../contexts/ShopContext';
import { getUser, isSuperAdmin } from '../../services/session';
import '../shops/ShopList.css';

const StoreList = () => {
  const { selectedShop, selectedStore, selectStore, clearStore, shopStores, hideStoresNav } = useShop();

  if (hideStoresNav) {
    return <Navigate to="/items" replace />;
  }

  const fetchStores = async (page, limit, filters) => {
    const result = await storesApi.getAll(page, limit, filters);
    if (getUser()?.role !== 'user' || !selectedShop) {
      return result;
    }
    const list = unwrapList(result).filter(store =>
      (store.shops || []).some(shop => shop.id === selectedShop.id)
    );
    return Array.isArray(result) ? list : { ...result, data: list, total: list.length };
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Select',
      accessor: 'id',
      render: (id, row) => (
        <button
          onClick={() => selectStore(row)}
          className={`select-shop-btn ${selectedStore?.id === id ? 'selected' : ''}`}
        >
          {selectedStore?.id === id ? 'Selected' : 'Select Store'}
        </button>
      )
    }
  ];

  return (
    <div>
      {selectedStore && (
        <div className="selected-shop-banner">
          <span>Selected Store: <strong>{selectedStore.name}</strong></span>
          {shopStores?.length !== 1 && (
            <button onClick={clearStore} className="clear-shop-btn">Clear Selection</button>
          )}
        </div>
      )}
      <Listing
        title="Stores"
        columns={columns}
        fetchData={fetchStores}
        basePath="/stores"
        onDelete={isSuperAdmin() ? storesApi.delete : undefined}
        writePermission="stores.write"
        deletePermission="stores.delete"
        showFilters={false}
      />
    </div>
  );
};

export default StoreList;
