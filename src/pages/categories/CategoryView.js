import React from 'react';
import SingleView from '../../components/SingleView';
import { categoriesApi } from '../../services/api';

const CategoryView = () => {
  const fields = [
    { label: 'Name', accessor: 'name' },
  ];

  return (
    <SingleView
      title="Category Details"
      fetchData={categoriesApi.getOne}
      fields={fields}
      basePath="/categories"
      writePermission="categories.write"
    />
  );
};

export default CategoryView;

