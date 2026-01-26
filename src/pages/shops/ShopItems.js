import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Listing from '../../components/Listing';
import Navigation from '../../components/Navigation';
import { shopsApi, itemsApi } from '../../services/api';
import './ShopItems.css';

const ShopItems = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shopName, setShopName] = React.useState('');
  const [assetValue, setAssetValue] = React.useState(null);

  React.useEffect(() => {
    const loadShopData = async () => {
      try {
        const shop = await shopsApi.getOne(id);
        setShopName(shop?.name || '');
        
        const assetResult = await shopsApi.getAssetValue(id);
        setAssetValue(assetResult.assetValue);
      } catch (error) {
        console.error('Error loading shop data:', error);
      }
    };
    loadShopData();
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
    {
      header: 'Transfer',
      accessor: 'id',
      render: (value, row) => (
        <button
          onClick={() => navigate(`/items/transfer?itemId=${value}&fromShopId=${id}`)}
          className="transfer-button"
        >
          Transfer to Store
        </button>
      )
    }
  ];

  return (
    <div>
      <Navigation />
      <div className="listing-container">
        <div className="listing-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => navigate(`/shops/${id}`)} className="back-button">
              ← Back to Shop
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <h1>Shop Items{shopName && ` - ${shopName}`}</h1>
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
          fetchData={() => shopsApi.getItems(id)}
          basePath="/items"
          onDelete={itemsApi.delete}
        />
      </div>
    </div>
  );
};

export default ShopItems;
