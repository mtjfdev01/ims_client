import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SingleView from '../../components/SingleView';
import { shopsApi } from '../../services/api';
import { hasPermission } from '../../services/session';
import { formatAmount } from '../../utils/formatAmount';

const ShopView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [assetValue, setAssetValue] = useState(null);

  useEffect(() => {
    const loadAssetValue = async () => {
      try {
        const result = await shopsApi.getAssetValue(id);
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
    { label: 'Branch', accessor: 'branch' },
    { label: 'Dealer', accessor: 'dealer' },
    { label: 'Location', accessor: 'location' },
    { 
      label: 'Stores', 
      accessor: 'stores',
      render: (value) => Array.isArray(value) && value.length > 0 
        ? value.map(s => s.name).join(', ') 
        : 'No stores assigned'
    },
    {
      label: 'Asset Value',
      accessor: 'assetValue',
      render: () => assetValue !== null 
        ? formatAmount(assetValue) 
        : 'Loading...'
    },
  ];

  const customActions = [
    hasPermission('items') && {
      label: 'View Items',
      onClick: (data, id) => navigate(`/shops/${id}/items`)
    },
    hasPermission('sales') && {
      label: 'View Sales',
      onClick: (data, id) => navigate(`/shops/${id}/sales`)
    },
    hasPermission('expenses') && {
      label: 'View Expenses',
      onClick: (data, id) => navigate(`/shops/${id}/expenses`)
    }
  ].filter(Boolean);

  return (
    <SingleView
      title="Shop Details"
      fetchData={shopsApi.getOne}
      fields={fields}
      basePath="/shops"
      writePermission="shops.write"
      customActions={customActions}
    />
  );
};

export default ShopView;

