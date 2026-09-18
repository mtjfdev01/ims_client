import React from 'react';
import { Navigate } from 'react-router-dom';
import Listing from '../../components/Listing';
import { shopsApi } from '../../services/api';
import { useShop } from '../../contexts/ShopContext';
import { hasSingleAssignedShop, isSuperAdmin } from '../../services/session';
import './ShopList.css';

const ShopList = () => {
  const { selectedShop, selectShop, clearShop } = useShop();

  if (hasSingleAssignedShop()) {
    return <Navigate to="/items" replace />;
  }

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Branch', accessor: 'branch' },
    { header: 'Dealer', accessor: 'dealer' },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (id, row) => (
        <button
          onClick={() => selectShop(row)}
          className={`select-shop-btn ${selectedShop?.id === id ? 'selected' : ''}`}
        >
          {selectedShop?.id === id ? 'Selected' : 'Select Shop'}
        </button>
      )
    }
  ];

  return (
    <div>
      {selectedShop && (
        <div className="selected-shop-banner">
          <span>Selected Shop: <strong>{selectedShop.name}</strong> ({selectedShop.branch})</span>
          <button onClick={clearShop} className="clear-shop-btn">Clear Selection</button>
        </div>
      )}
      <Listing
        title="Shops"
        columns={columns}
        fetchData={shopsApi.getAll}
        basePath="/shops"
        onDelete={isSuperAdmin() ? shopsApi.delete : undefined}
        writePermission="shops.write"
        deletePermission="shops.delete"
        showFilters={false}
      />
    </div>
  );
};

export default ShopList;

