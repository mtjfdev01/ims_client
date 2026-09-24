import React from 'react';
import Listing from '../../components/Listing';
import { ordersApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import FilterPanel from '../../components/FilterPanel';

const OrderList = () => {
  const columns = [
    { 
      header: 'Items', 
      accessor: 'orderItems',
      render: (value) => {
        if (!value || !Array.isArray(value)) return 'No items';
        return `${value.length} item(s)`;
      }
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (value) => {
        const statusMap = {
          'pending': 'Pending',
          'in_progress': 'In Progress',
          'completed': 'Completed',
          'cancelled': 'Cancelled'
        };
        return statusMap[value] || value;
      }
    },
    { 
      header: 'Total Amount', 
      accessor: 'totalAmount',
      render: (value) => formatAmount(value)
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

  return (
    <Listing
      title="Orders"
      columns={columns}
      fetchData={ordersApi.getAll}
      basePath="/orders"
      onDelete={ordersApi.delete}
      writePermission="orders.write"
      deletePermission="orders.delete"
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <FilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default OrderList;
