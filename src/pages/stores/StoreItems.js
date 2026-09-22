import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Listing from '../../components/Listing';
import { storesApi, itemsApi } from '../../services/api';
import { hasPermission } from '../../services/session';
import './StoreItems.css';

const StoreItems = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [storeName, setStoreName] = React.useState('');
  const [assetValue, setAssetValue] = React.useState(null);

  React.useEffect(() => {
    const loadStoreData = async () => {
      try {
        const store = await storesApi.getOne(id);
        setStoreName(store?.name || '');
        
        const assetResult = await storesApi.getAssetValue(id);
        setAssetValue(assetResult.assetValue);
      } catch (error) {
        console.error('Error loading store data:', error);
      }
    };
    loadStoreData();
  }, [id]);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Company', 
      accessor: 'company',
      render: (value) => value?.name || 'N/A'
    },
    { 
      header: 'Categories', 
      accessor: 'categories',
      render: (value) => Array.isArray(value) ? value.map(c => c.name).join(', ') : 'N/A'
    },
    { header: 'Location', accessor: 'location' },
    { 
      header: 'Quantity', 
      accessor: 'quantity',
      render: (value) => value || 1
    },
    { 
      header: 'Purchase Price (per unit)', 
      accessor: 'purchasePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
    { 
      header: 'Total Value', 
      accessor: 'totalValue',
      render: (value, row) => {
        const qty = row.quantity || 1;
        const price = typeof row.purchasePrice === 'string' 
          ? parseFloat(row.purchasePrice) 
          : (row.purchasePrice || 0);
        return `${(qty * price).toFixed(2)}`;
      }
    },
    { 
      header: 'Min Sale Price', 
      accessor: 'minimumSalePrice',
      render: (value) => typeof value === 'string' ? `${parseFloat(value).toFixed(2)}` : `${value?.toFixed(2) || '0.00'}`
    },
    ...(hasPermission('issues') ? [{
      header: 'Stock Transfer',
      accessor: 'id',
      render: (value) => (
        <button
          onClick={() => navigate(`/items/transfer?itemId=${value}&fromStoreId=${id}`)}
          className="transfer-button"
        >
          Stock Transfer to Shop
        </button>
      )
    }] : [])
  ];

  return (
    <div>
      <div className="listing-container">
        <div className="listing-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => navigate(`/stores/${id}`)} className="back-button">
              ← Back to Store
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <h1>Store Items{storeName && ` - ${storeName}`}</h1>
              {assetValue !== null && (
                <div style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  Asset Value: {assetValue.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
        <Listing
          title=""
          columns={columns}
          fetchData={() => storesApi.getItems(id)}
          basePath="/items"
          writePermission="items.write"
          deletePermission="items.delete"
          onDelete={itemsApi.delete}
        />
      </div>
    </div>
  );
};

export default StoreItems;
