import React from 'react';
import SingleView from '../../components/SingleView';
import PermissionLink from '../../components/PermissionLink';
import { sellersApi } from '../../services/api';
import { formatAmount } from '../../utils/formatAmount';
import { hasPermission } from '../../services/session';
import '../sales/SaleView.css';

const SellerView = () => {
  const fields = [
    { label: 'Name', accessor: 'name' },
    { label: 'Phone', accessor: 'phone', render: (value) => value || '—' },
    { label: 'Email', accessor: 'email', render: (value) => value || '—' },
    { label: 'Address', accessor: 'address', render: (value) => value || '—' },
    { label: 'CNIC', accessor: 'cnic', render: (value) => value || '—' },
    { label: 'Shop', accessor: 'shop', render: (value) => value?.name || 'Organization' },
    { label: 'Notes', accessor: 'notes', render: (value) => value || '—' },
  ];

  if (hasPermission('purchases')) {
    fields.push({
      label: 'Purchases',
      accessor: 'purchases',
      render: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'No purchases recorded';
        }
        return (
          <div className="sale-items-display">
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Purchase</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {value.map((purchase) => {
                  const price = typeof purchase.purchasePrice === 'string'
                    ? parseFloat(purchase.purchasePrice)
                    : (purchase.purchasePrice || 0);
                  const qty = purchase.quantity || 1;
                  return (
                    <tr key={purchase.id}>
                      <td>
                        <PermissionLink module="purchases" to={`/purchases/${purchase.id}`}>#{purchase.id}</PermissionLink>
                      </td>
                      <td>{purchase.item?.name || '—'}</td>
                      <td>{qty}</td>
                      <td>{formatAmount(price * qty)}</td>
                      <td>{purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      },
    });
  }

  return (
    <SingleView
      title="Seller Details"
      fetchData={sellersApi.getOne}
      fields={fields}
      basePath="/sellers"
      writePermission="sellers.write"
    />
  );
};

export default SellerView;
