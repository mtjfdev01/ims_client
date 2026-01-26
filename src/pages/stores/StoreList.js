import React from 'react';
import Listing from '../../components/Listing';
import { storesApi } from '../../services/api';

const StoreList = () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Location', accessor: 'location' },
  ];

  return (
    <Listing
      title="Stores"
      columns={columns}
      fetchData={storesApi.getAll}
      basePath="/stores"
      onDelete={storesApi.delete}
      showFilters={false}
    />
  );
};

export default StoreList;

