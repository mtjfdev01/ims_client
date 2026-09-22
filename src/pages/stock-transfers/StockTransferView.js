import React from 'react';
import SingleView from '../../components/SingleView';
import { issuesApi } from '../../services/api';
import { formatTransferDate, locationLabel } from './locationLabel';

const StockTransferView = () => {
  const loadTransfer = async (id) => {
    const result = await issuesApi.getOne(id);
    if (result?.error) {
      throw new Error('Stock transfer not found');
    }
    return result;
  };

  const fields = [
    {
      label: 'Item',
      accessor: 'item',
      render: (value) => value?.name ? `${value.name} (ID: ${value.id})` : `Item #${value?.id || '—'}`,
    },
    {
      label: 'From',
      accessor: 'fromShop',
      render: (_value, row) => locationLabel(row.fromShop, row.fromStore),
    },
    {
      label: 'To',
      accessor: 'toShop',
      render: (_value, row) => locationLabel(row.toShop, row.toStore),
    },
    { label: 'Quantity', accessor: 'quantity' },
    {
      label: 'Date',
      accessor: 'issuedDate',
      render: (value) => formatTransferDate(value),
    },
    {
      label: 'Notes',
      accessor: 'notes',
      render: (value) => value || '—',
    },
  ];

  return (
    <SingleView
      title="Stock Transfer Details"
      fetchData={loadTransfer}
      fields={fields}
      basePath="/stock-transfers"
      writePermission="issues.write"
    />
  );
};

export default StockTransferView;
