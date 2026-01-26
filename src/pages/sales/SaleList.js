import React from 'react';
import Listing from '../../components/Listing';
import { salesApi } from '../../services/api';

const SaleList = () => {
  const columns = [
    { 
      header: 'Items', 
      accessor: 'saleItems',
      render: (value) => {
        if (!value || !Array.isArray(value)) return 'No items';
        return `${value.length} item(s)`;
      }
    },
    { 
      header: 'Total Amount', 
      accessor: 'totalAmount',
      render: (value) => typeof value === 'string' 
        ? `${parseFloat(value).toFixed(2)}` 
        : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      header: 'Total Profit', 
      accessor: 'totalProfit',
      render: (value) => typeof value === 'string' 
        ? `${parseFloat(value).toFixed(2)}` 
        : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      header: 'Date', 
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    },
  ];

  const totalsConfig = [
    { key: 'totalAmount', label: 'Total Sales Amount', format: 'currency' },
    { key: 'totalProfit', label: 'Total Profit', format: 'currency' },
  ];

  return (
    <Listing
      title="Sales"
      columns={columns}
      fetchData={salesApi.getAll}
      basePath="/sales"
      onDelete={salesApi.delete}
      fetchTotals={salesApi.getTotals}
      totalsConfig={totalsConfig}
    />
  );
};

export default SaleList;
