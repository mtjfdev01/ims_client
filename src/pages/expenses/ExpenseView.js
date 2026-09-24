import React from 'react';
import SingleView from '../../components/SingleView';
import { expensesApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';

const ExpenseView = () => {
  const fields = [
    { label: 'Description', accessor: 'description' },
    { label: 'Price', accessor: 'price', render: (value) => formatAmount(value) },
  ];

  return (
    <SingleView
      title="Expense Details"
      fetchData={expensesApi.getOne}
      fields={fields}
      basePath="/expenses"
      writePermission="expenses.write"
    />
  );
};

export default ExpenseView;

