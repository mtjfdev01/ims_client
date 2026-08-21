import React from 'react';
import SingleView from '../../components/SingleView';
import { itemsApi } from '../../services/api';

const ItemView = () => {
  const fields = [
    { label: 'Name', accessor: 'name' },
    { 
      label: 'Company', 
      accessor: 'company',
      render: (value) => value?.name || 'N/A'
    },
    { 
      label: 'Categories', 
      accessor: 'categories',
      render: (value) => Array.isArray(value) && value.length > 0
        ? value.map(c => c.name || c).join(', ')
        : 'No categories'
    },
    { 
      label: 'Store', 
      accessor: 'store',
      render: (value) => value?.name || 'N/A'
    },
    { 
      label: 'Shop', 
      accessor: 'shop',
      render: (value) => value?.name || 'N/A'
    },
    { label: 'Location', accessor: 'location' },
    { 
      label: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value ?? 0
    },
    { 
      label: 'FIFO Cost (next out)', 
      accessor: 'purchasePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      label: 'Stock Value (FIFO)', 
      accessor: 'fifoValue',
      render: (value, row) => {
        if (typeof value === 'number') {
          return value.toFixed(2);
        }
        const qty = row.quantity ?? 0;
        const price = typeof row.purchasePrice === 'string' 
          ? parseFloat(row.purchasePrice) 
          : (row.purchasePrice || 0);
        return `${(qty * price).toFixed(2)}`;
      }
    },
    { 
      label: 'FIFO Lots', 
      accessor: 'lots',
      render: (lots) => {
        if (!Array.isArray(lots) || lots.length === 0) {
          return 'No remaining lots';
        }
        return (
          <table className="sale-items-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Remaining</th>
                <th>Unit Cost</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id}>
                  <td>{lot.receivedAt ? new Date(lot.receivedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{lot.remainingQuantity}</td>
                  <td>{Number(lot.unitCost).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
    },
    { 
      label: 'Minimum Sale Price', 
      accessor: 'minimumSalePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
  ];

  return (
    <SingleView
      title="Item Details"
      fetchData={itemsApi.getOne}
      fields={fields}
      basePath="/items"
    />
  );
};

export default ItemView;

