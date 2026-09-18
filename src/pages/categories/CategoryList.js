import React from 'react';
import Listing from '../../components/Listing';
import { categoriesApi } from '../../services/api';

const CategoryList = () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
  ];

  return (
    <Listing
      title="Categories"
      columns={columns}
      fetchData={categoriesApi.getAll}
      basePath="/categories"
      onDelete={categoriesApi.delete}
      writePermission="categories.write"
      deletePermission="categories.delete"
      showFilters={false}
    />
  );
};

export default CategoryList;

