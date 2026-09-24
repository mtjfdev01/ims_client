import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Listing from '../../components/Listing';
import { storesApi, itemsApi } from '../../services/api';
import { hasPermission } from '../../services/session';
import { conditionLabel } from '../items/itemCondition';
import { formatAmount } from '../../utils/formatAmount';
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
    { header: 'Unique ID', accessor: 'uniqueIdentifier', render: (value) => value || '—' },
    { header: 'Condition', accessor: 'condition', render: (value) => conditionLabel(value) },
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
      render: (value) => formatAmount(value)
    },
    { 
      header: 'Total Value', 
      accessor: 'totalValue',
      render: (value, row) => {
        const qty = row.quantity || 1;
        const price = typeof row.purchasePrice === 'string' 
          ? parseFloat(row.purchasePrice) 
          : (row.purchasePrice || 0);
        return formatAmount(qty * price);
      }
    },
    { 
      header: 'Min Sale Price', 
      accessor: 'minimumSalePrice',
      render: (value) => formatAmount(value)
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
                  Asset Value: {formatAmount(assetValue)}
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
