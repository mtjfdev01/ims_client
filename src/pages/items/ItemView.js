import React from 'react';
import SingleView from '../../components/SingleView';
import { itemsApi } from '../../services/api';

const ItemView = () => {
  const fields = [
    { label: 'Name', accessor: 'name' },
    { 
      label: 'Company', 
      accessor: 'company',
      render: (value) => value?.name || 'N/A'
    },
    { 
      label: 'Categories', 
      accessor: 'categories',
      render: (value) => Array.isArray(value) && value.length > 0
        ? value.map(c => c.name || c).join(', ')
        : 'No categories'
    },
    { 
      label: 'Store', 
      accessor: 'store',
      render: (value) => value?.name || 'N/A'
    },
    { 
      label: 'Shop', 
      accessor: 'shop',
      render: (value) => value?.name || 'N/A'
    },
    { label: 'Location', accessor: 'location' },
    { 
      label: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value || 1
    },
    { 
      label: 'Purchase Price (per unit)', 
      accessor: 'purchasePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      label: 'Total Value', 
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
      label: 'Minimum Sale Price', 
      accessor: 'minimumSalePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
  ];

  return (
    <SingleView
      title="Item Details"
      fetchData={itemsApi.getOne}
      fields={fields}
      basePath="/items"
    />
  );
};

export default ItemView;

