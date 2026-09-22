import React from 'react';
import SingleView from '../../components/SingleView';
import PermissionLink from '../../components/PermissionLink';
import { purchasesApi } from '../../services/api';

const PurchaseView = () => {
  const fields = [
    {
      label: 'Item',
      accessor: 'item',
      render: (value) => {
        const label = value?.name ? `${value.name} (ID: ${value.id})` : `Item #${value?.id || 'N/A'}`;
        return value?.id
          ? <PermissionLink module="items" to={`/items/${value.id}`}>{label}</PermissionLink>
          : label;
      }
    },
    { 
      label: 'Purchase Price (per unit)', 
      accessor: 'purchasePrice',
      render: (value) => typeof value === 'string' 
        ? `${parseFloat(value).toFixed(2)}` 
        : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      label: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value || 1
    },
    { 
      label: 'Total Amount', 
      accessor: 'totalAmount',
      render: (value, row) => {
        const price = typeof row.purchasePrice === 'string' 
          ? parseFloat(row.purchasePrice) 
          : (row.purchasePrice || 0);
        const qty = row.quantity || 1;
        return `${(price * qty).toFixed(2)}`;
      }
    },
    { 
      label: 'Purchase Date', 
      accessor: 'purchaseDate',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString();
      }
    },
    { 
      label: 'Created At', 
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    },
  ];

  return (
    <SingleView
      title="Purchase Details"
      fetchData={purchasesApi.getOne}
      fields={fields}
      basePath="/purchases"
      writePermission="purchases.write"
    />
  );
};

export default PurchaseView;
