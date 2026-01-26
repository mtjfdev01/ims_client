import React from 'react';
import Listing from '../../components/Listing';
import ItemFilterPanel from './ItemFilterPanel';
import { itemsApi } from '../../services/api';

const ItemList = () => {
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
      render: (value) => value || 1
    },
    { 
      header: 'Purchase Price (per unit)', 
      accessor: 'purchasePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      header: 'Total Value', 
      accessor: 'totalValue',
      render: (value, row) => {
        const qty = row.quantity || 1;
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
      renderFilters={(handleFilterChange, currentFilters) => (
        <ItemFilterPanel 
          onFilterChange={handleFilterChange}
          onClear={() => handleFilterChange({ filterType: '', search: '' })}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default ItemList;

