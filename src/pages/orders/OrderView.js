import React from 'react';
import SingleView from '../../components/SingleView';
import { ordersApi } from '../../services/api';
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
                        {orderItem.item?.name 
                          ? `${orderItem.item.name} (ID: ${orderItem.item.id})` 
                          : `Item #${orderItem.item?.id || orderItem.itemId || 'N/A'}`}
                      </td>
                      <td>{issuedQty}</td>
                      <td>{returnedQty}</td>
                      <td>{netQty}</td>
                      <td>{typeof orderItem.amount === 'string' 
                        ? parseFloat(orderItem.amount).toFixed(2) 
                        : (orderItem.amount?.toFixed(2) || '0.00')}
                      </td>
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
    />
  );
};

export default OrderView;
