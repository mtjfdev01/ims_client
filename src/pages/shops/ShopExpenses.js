import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Listing from '../../components/Listing';
import Navigation from '../../components/Navigation';
import { expensesApi, shopsApi } from '../../services/api';
import './ShopExpenses.css';

const ShopExpenses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shopName, setShopName] = React.useState('');

  React.useEffect(() => {
    const loadShopName = async () => {
      try {
        const shop = await shopsApi.getOne(id);
        setShopName(shop?.name || '');
      } catch (error) {
        console.error('Error loading shop:', error);
      }
    };
    loadShopName();
  }, [id]);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Description', accessor: 'description' },
    { header: 'Price', accessor: 'price' },
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
            <h1>Shop Expenses{shopName && ` - ${shopName}`}</h1>
          </div>
        </div>
        <Listing
          title=""
          columns={columns}
          fetchData={() => expensesApi.getAll(undefined, undefined, { shopId: id })}
          basePath="/expenses"
          onDelete={expensesApi.delete}
        />
      </div>
    </div>
  );
};

export default ShopExpenses;
