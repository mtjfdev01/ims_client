import React from 'react';
import Listing from '../../components/Listing';
import ItemFilterPanel from './ItemFilterPanel';
import { itemsApi } from '../../services/api';
import { useShop } from '../../contexts/ShopContext';
import { getAssignedShops, getUser, isSuperAdmin, isTenantAdmin } from '../../services/session';

const ItemList = () => {
  const { selectedShop } = useShop();
  const user = getUser();
  const canSeeAllTypes = isSuperAdmin(user) || isTenantAdmin(user);
  const showShopOption = canSeeAllTypes || !!selectedShop || getAssignedShops(user).length > 0;
  const showStoreOption = canSeeAllTypes;
  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Company', 
      accessor: 'company',
      render: (value) => value?.name || 'N/A'
    },
    { 
      header: 'Categories', 
      accessor: 'categories',
      render: (value) => Array.isArray(value) && value.length > 0 
        ? value.map(c => c.name || c).join(', ') 
        : 'No categories'
    },
    { 
      header: 'Store', 
      accessor: 'store',
      render: (value) => value?.name || 'N/A'
    },
    { 
      header: 'Shop', 
      accessor: 'shop',
      render: (value) => value?.name || 'N/A'
    },
    { header: 'Location', accessor: 'location' },
    { 
      header: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value ?? 0
    },
    { 
      header: 'FIFO Cost (next out)', 
      accessor: 'purchasePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      header: 'Total Value', 
      accessor: 'totalValue',
      render: (value, row) => {
        const qty = row.quantity ?? 0;
        const price = typeof row.purchasePrice === 'string' 
          ? parseFloat(row.purchasePrice) 
          : (row.purchasePrice || 0);
        return `${(qty * price).toFixed(2)}`;
      }
    },
    { 
      header: 'Min Sale Price', 
      accessor: 'minimumSalePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
  ];

  return (
    <Listing
      title="Items"
      columns={columns}
      fetchData={itemsApi.getAll}
      basePath="/items"
      onDelete={itemsApi.delete}
      writePermission="items.write"
      deletePermission="items.delete"
      renderFilters={(handleFilterChange, currentFilters) => (
        <ItemFilterPanel 
          onFilterChange={handleFilterChange}
          onClear={() => handleFilterChange({ filterType: '', search: '', date: '', dateFrom: '', dateTo: '' })}
          currentFilters={currentFilters}
          showStoreOption={showStoreOption}
          showShopOption={showShopOption}
        />
      )}
    />
  );
};

export default ItemList;

