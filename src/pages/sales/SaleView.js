import React from 'react';
import SingleView from '../../components/SingleView';
import { salesApi } from '../../services/api';
import './SaleView.css';

const SaleView = () => {
  const fields = [
    { 
      label: 'Total Amount', 
      accessor: 'totalAmount',
      render: (value) => typeof value === 'string' 
        ? `${parseFloat(value).toFixed(2)}` 
        : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      label: 'Total Profit', 
      accessor: 'totalProfit',
      render: (value) => typeof value === 'string' 
        ? `${parseFloat(value).toFixed(2)}` 
        : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      label: 'Date', 
      accessor: 'createdAt',
      render: (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    },
    {
      label: 'Items',
      accessor: 'saleItems',
      render: (value, row) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'No items';
        }
        return (
          <div className="sale-items-display">
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {value.map((saleItem, index) => (
                  <tr key={index}>
                    <td>
                      {saleItem.item?.name 
                        ? `${saleItem.item.name} (ID: ${saleItem.item.id})` 
                        : `Item #${saleItem.item?.id || saleItem.itemId || 'N/A'}`}
                    </td>
                    <td>{saleItem.quantity || 0}</td>
                    <td>{typeof saleItem.amount === 'string' 
                      ? parseFloat(saleItem.amount).toFixed(2) 
                      : (saleItem.amount?.toFixed(2) || '0.00')}
                    </td>
                    <td>{typeof saleItem.profit === 'string' 
                      ? parseFloat(saleItem.profit).toFixed(2) 
                      : (saleItem.profit?.toFixed(2) || '0.00')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    },
  ];

  return (
    <SingleView
      title="Sale Details"
      fetchData={salesApi.getOne}
      fields={fields}
      basePath="/sales"
    />
  );
};

export default SaleView;
