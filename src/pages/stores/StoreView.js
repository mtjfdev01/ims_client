import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SingleView from '../../components/SingleView';
import { storesApi } from '../../services/api';

const StoreView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [assetValue, setAssetValue] = useState(null);

  useEffect(() => {
    const loadAssetValue = async () => {
      try {
        const result = await storesApi.getAssetValue(id);
        setAssetValue(result.assetValue);
      } catch (error) {
        console.error('Error loading asset value:', error);
      }
    };
    if (id) {
      loadAssetValue();
    }
  }, [id]);

  const fields = [
    { label: 'Name', accessor: 'name' },
    { label: 'Location', accessor: 'location' },
    { 
      label: 'Shops', 
      accessor: 'shops',
      render: (value) => Array.isArray(value) && value.length > 0 
        ? value.map(s => s.name).join(', ') 
        : 'No shops assigned'
    },
    {
      label: 'Asset Value',
      accessor: 'assetValue',
      render: () => assetValue !== null 
        ? `${assetValue.toFixed(2)}` 
        : 'Loading...'
    },
  ];

  const customActions = [
    {
      label: 'View Items',
      onClick: (data, id) => navigate(`/stores/${id}/items`)
    }
  ];

  return (
    <SingleView
      title="Store Details"
      fetchData={storesApi.getOne}
      fields={fields}
      basePath="/stores"
      customActions={customActions}
    />
  );
};

export default StoreView;

