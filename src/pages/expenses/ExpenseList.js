import React from 'react';
import Listing from '../../components/Listing';
import { expensesApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';

const ExpenseList = () => {
  const columns = [
    { 
      header: 'Description', 
      accessor: 'description' 
    },
    { 
      header: 'Price', 
      accessor: 'price',
      render: (value) => formatAmount(value)
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
      writePermission="expenses.write"
      deletePermission="expenses.delete"
      fetchTotals={expensesApi.getTotals}
      totalsConfig={totalsConfig}
    />
  );
};

export default ExpenseList;

