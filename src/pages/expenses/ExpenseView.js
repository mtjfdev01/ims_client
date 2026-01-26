import React from 'react';
import SingleView from '../../components/SingleView';
import { expensesApi } from '../../services/api';

const ExpenseView = () => {
  const fields = [
    { label: 'Description', accessor: 'description' },
    { label: 'Price', accessor: 'price' },
  ];

  return (
    <SingleView
      title="Expense Details"
      fetchData={expensesApi.getOne}
      fields={fields}
      basePath="/expenses"
    />
  );
};

export default ExpenseView;

