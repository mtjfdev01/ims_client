import React from 'react';
import Listing from '../../components/Listing';
import SearchFilterPanel from '../../components/SearchFilterPanel';
import { companiesApi } from '../../services/api';

const CompanyList = () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Categories', 
      accessor: 'categories',
      render: (value) => Array.isArray(value) && value.length > 0
        ? value.map(c => c.name || c).join(', ')
        : '—'
    },
  ];

  return (
    <Listing
      title="Companies"
      columns={columns}
      fetchData={companiesApi.getAll}
      basePath="/companies"
      onDelete={companiesApi.delete}
      writePermission="companies.write"
      deletePermission="companies.delete"
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <SearchFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
          placeholder="Search company name"
        />
      )}
    />
  );
};

export default CompanyList;

