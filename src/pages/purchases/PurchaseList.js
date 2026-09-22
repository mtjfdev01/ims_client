import React from 'react';
import Listing from '../../components/Listing';
import { purchasesApi } from '../../services/api';
import PurchaseFilterPanel from './PurchaseFilterPanel';

const PurchaseList = () => {
  const columns = [
    { 
      header: 'Item', 
      accessor: 'item',
      render: (value) => value?.name ? `${value.name} (ID: ${value.id})` : `Item #${value?.id || 'N/A'}`
    },
    { 
      header: 'Purchase Price (per unit)', 
      accessor: 'purchasePrice',
      render: (value) => typeof value === 'string' 
        ? `${parseFloat(value).toFixed(2)}` 
        : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      header: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value || 1
    },
    { 
      header: 'Total Amount', 
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
      header: 'Purchase Date', 
      accessor: 'purchaseDate',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString();
      }
    },
    { 
      header: 'Created At', 
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    },
  ];

  const totalsConfig = [
    { key: 'total', label: 'Total Purchases', format: 'currency' },
  ];

  return (
    <Listing
      title="Purchases"
      columns={columns}
      fetchData={purchasesApi.getAll}
      basePath="/purchases"
      onDelete={purchasesApi.delete}
      writePermission="purchases.write"
      deletePermission="purchases.delete"
      fetchTotals={purchasesApi.getTotals}
      totalsConfig={totalsConfig}
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <PurchaseFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default PurchaseList;
