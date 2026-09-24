import React from 'react';
import SingleView from '../../components/SingleView';
import PermissionLink from '../../components/PermissionLink';
import { purchasesApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import { itemOptionLabel } from '../items/itemCondition';

const PurchaseView = () => {
  const fields = [
    {
      label: 'Item',
      accessor: 'item',
      render: (value) => {
        const label = itemOptionLabel(value);
        return value?.id
          ? <PermissionLink module="items" to={`/items/${value.id}`}>{label}</PermissionLink>
          : label;
      }
    },
    { 
      label: 'Purchase Price (per unit)', 
      accessor: 'purchasePrice',
      render: (value) => formatAmount(value)
    },
    { 
      label: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value || 1
    },
    { 
      label: 'Total Amount', 
      accessor: 'totalAmount',
      render: (value, row) => {
        const price = typeof row.purchasePrice === 'string' 
          ? parseFloat(row.purchasePrice) 
          : (row.purchasePrice || 0);
        const qty = row.quantity || 1;
        return formatAmount(price * qty);
      }
    },
    { 
      label: 'Purchase Date', 
      accessor: 'purchaseDate',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString();
      }
    },
    {
      label: 'Seller',
      accessor: 'seller',
      render: (value) => {
        if (!value?.id) return '—';
        const label = value.phone ? `${value.name} (${value.phone})` : value.name;
        return <PermissionLink module="sellers" to={`/sellers/${value.id}`}>{label}</PermissionLink>;
      }
    },
    { 
      label: 'Created At', 
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    },
  ];

  return (
    <SingleView
      title="Purchase Details"
      fetchData={purchasesApi.getOne}
      fields={fields}
      basePath="/purchases"
      writePermission="purchases.write"
    />
  );
};

export default PurchaseView;
