import React from 'react';
import Listing from '../../components/Listing';
import { sellersApi } from '../../services/api';

const SellerList = () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone', render: (value) => value || '—' },
    { header: 'Email', accessor: 'email', render: (value) => value || '—' },
    { header: 'Address', accessor: 'address', render: (value) => value || '—' },
    { header: 'CNIC', accessor: 'cnic', render: (value) => value || '—' },
    {
      header: 'Shop',
      accessor: 'shop',
      render: (value) => value?.name || 'Organization',
    },
  ];

  return (
    <Listing
      title="Sellers"
      columns={columns}
      fetchData={sellersApi.getAll}
      basePath="/sellers"
      onDelete={sellersApi.delete}
      writePermission="sellers.write"
      deletePermission="sellers.delete"
    />
  );
};

export default SellerList;
