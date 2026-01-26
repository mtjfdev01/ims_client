import React from 'react';
import Listing from '../../components/Listing';
import { expensesApi } from '../../services/api';

const ExpenseList = () => {
  const columns = [
    { 
      header: 'Description', 
      accessor: 'description' 
    },
    { 
      header: 'Price', 
      accessor: 'price',
      render: (value) => typeof value === 'string' 
        ? `${parseFloat(value).toFixed(2)}` 
        : `${value?.toFixed(2) || '0.00'}`
    },
  ];

  const totalsConfig = [
    { key: 'total', label: 'Total Expenses', format: 'currency' },
  ];

  return (
    <Listing
      title="Expenses"
      columns={columns}
      fetchData={expensesApi.getAll}
      basePath="/expenses"
      onDelete={expensesApi.delete}
      fetchTotals={expensesApi.getTotals}
      totalsConfig={totalsConfig}
    />
  );
};

export default ExpenseList;

