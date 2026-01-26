import React from 'react';
import SingleView from '../../components/SingleView';
import { companiesApi } from '../../services/api';

const CompanyView = () => {
  const fields = [
    { label: 'Name', accessor: 'name' },
    { 
      label: 'Categories', 
      accessor: 'categories',
      render: (value) => Array.isArray(value) ? value.join(', ') : value
    },
  ];

  return (
    <SingleView
      title="Company Details"
      fetchData={companiesApi.getOne}
      fields={fields}
      basePath="/companies"
    />
  );
};

export default CompanyView;

