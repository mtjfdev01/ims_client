import React from 'react';
import Listing from '../../components/Listing';
import SearchFilterPanel from '../../components/SearchFilterPanel';
import { issuesApi } from '../../services/api';
import { formatTransferDate, locationLabel } from './locationLabel';

const fetchTransfers = async (page, limit, filters) => {
  const rows = await issuesApi.getAll();
  const list = Array.isArray(rows) ? rows : [];
  const search = filters?.search?.trim().toLowerCase();
  if (!search) {
    return list;
  }
  return list.filter((row) => {
    const haystack = [
      row.item?.name,
      row.item?.id,
      locationLabel(row.fromShop, row.fromStore),
      locationLabel(row.toShop, row.toStore),
      row.notes,
    ].join(' ').toLowerCase();
    return haystack.includes(search);
  });
};

const StockTransferList = () => {
  const columns = [
    {
      header: 'Item',
      accessor: 'item',
      render: (value) => value?.name ? `${value.name} (ID: ${value.id})` : `Item #${value?.id || '—'}`,
    },
    {
      header: 'From',
      accessor: 'fromShop',
      render: (_value, row) => locationLabel(row.fromShop, row.fromStore),
    },
    {
      header: 'To',
      accessor: 'toShop',
      render: (_value, row) => locationLabel(row.toShop, row.toStore),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (value) => value ?? 0,
    },
    {
      header: 'Date',
      accessor: 'issuedDate',
      render: (value) => formatTransferDate(value),
    },
  ];

  return (
    <Listing
      title="Stock Transfers"
      columns={columns}
      fetchData={fetchTransfers}
      basePath="/stock-transfers"
      onDelete={issuesApi.delete}
      writePermission="issues.write"
      deletePermission="issues.delete"
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <SearchFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
          placeholder="Search item, location, or notes"
        />
      )}
    />
  );
};

export default StockTransferList;
