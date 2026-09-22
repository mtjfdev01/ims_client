import React from 'react';
import Listing from '../../components/Listing';
import SearchFilterPanel from '../../components/SearchFilterPanel';
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
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <SearchFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
          placeholder="Search category name"
        />
      )}
    />
  );
};

export default CategoryList;

