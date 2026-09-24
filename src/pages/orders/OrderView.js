import React from 'react';
import SingleView from '../../components/SingleView';
import { ordersApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import { itemOptionLabel } from '../items/itemCondition';
import './OrderView.css';

const OrderView = () => {
  const fields = [
    { 
      label: 'Status', 
      accessor: 'status',
      render: (value) => {
        const statusMap = {
          'pending': 'Pending',
          'in_progress': 'In Progress',
          'completed': 'Completed',
          'cancelled': 'Cancelled'
        };
        return statusMap[value] || value;
      }
    },
    { 
      label: 'Total Amount', 
      accessor: 'totalAmount',
      render: (value) => formatAmount(value)
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
      accessor: 'orderItems',
      render: (value, row) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'No items';
        }
        return (
          <div className="order-items-display">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Issued Qty</th>
                  <th>Returned Qty</th>
                  <th>Net Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {value.map((orderItem, index) => {
                  const issuedQty = orderItem.quantity || 0;
                  const returnedQty = orderItem.returnedQuantity || 0;
                  const netQty = issuedQty - returnedQty;
                  return (
                    <tr key={index}>
                      <td>
                        {itemOptionLabel(orderItem.item)}
                      </td>
                      <td>{issuedQty}</td>
                      <td>{returnedQty}</td>
                      <td>{netQty}</td>
                      <td>{formatAmount(orderItem.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
    },
  ];

  return (
    <SingleView
      title="Order Details"
      fetchData={ordersApi.getOne}
      fields={fields}
      basePath="/orders"
      writePermission="orders.write"
    />
  );
};

export default OrderView;
