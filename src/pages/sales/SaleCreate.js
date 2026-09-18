import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { salesApi, itemsApi } from '../../services/api';
import RequireShop from '../../components/RequireShop';
import './SaleCreate.css';

const SaleCreate = () => {
  const navigate = useNavigate();
  const [saleItems, setSaleItems] = useState([
    {
      itemId: '',
      quantity: 1,
      amount: 0,
      profit: 0,
      selectedItem: null
    }
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      // Get current user's shops
      const userStr = localStorage.getItem('user');
      let userShopIds = [];
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Extract shop IDs from user's shops array
          if (user.shops && Array.isArray(user.shops)) {
            userShopIds = user.shops.map(shop => shop.id);
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }

      const data = await itemsApi.getAll();
      const itemsArray = Array.isArray(data) ? data : (data.data || []);
      
      // Filter to only show items that belong to shops (not stores)
      let shopItems = itemsArray.filter(item => item.shop && !item.store);
      
      // Further filter to only show items from user's shops
      if (userShopIds.length > 0) {
        shopItems = shopItems.filter(item => 
          item.shop && userShopIds.includes(item.shop.id)
        );
      }

      const selectedShopStr = localStorage.getItem('selectedShop');
      if (selectedShopStr) {
        try {
          const selectedShop = JSON.parse(selectedShopStr);
          if (selectedShop?.id) {
            shopItems = shopItems.filter(item => item.shop && item.shop.id === selectedShop.id);
          }
        } catch (e) {
          console.error('Error parsing selected shop from localStorage:', e);
        }
      }
      
      setItems(shopItems);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadItemDetails = async (itemId, index) => {
    try {
      const item = await itemsApi.getOne(itemId);
      const updatedItems = [...saleItems];
      updatedItems[index].selectedItem = item;
      setSaleItems(updatedItems);
      calculateItemProfit(index);
    } catch (error) {
      console.error('Error loading item details:', error);
    }
  };

  const calculateProfit = (amount, quantity, purchasePrice) => {
    if (!amount || !quantity || !purchasePrice) return 0;
    const totalCost = purchasePrice * quantity;
    const profit = amount - totalCost;
    return parseFloat(profit.toFixed(2));
  };

  const calculateItemProfit = (index) => {
    const updatedItems = [...saleItems];
    const item = updatedItems[index];
    
    if (item.selectedItem && item.quantity > 0 && item.amount > 0) {
      const purchasePrice = typeof item.selectedItem.purchasePrice === 'string' 
        ? parseFloat(item.selectedItem.purchasePrice) 
        : (item.selectedItem.purchasePrice || 0);
      item.profit = calculateProfit(item.amount, item.quantity, purchasePrice);
      setSaleItems(updatedItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...saleItems];
    updatedItems[index][field] = field === 'quantity' || field === 'amount' 
      ? (parseFloat(value) || 0) 
      : value;

    if (field === 'itemId') {
      updatedItems[index].selectedItem = null;
      updatedItems[index].profit = 0;
      updatedItems[index].amount = 0;
      setSaleItems(updatedItems);
      if (value) {
        loadItemDetails(value, index);
      }
    } else {
      setSaleItems(updatedItems);
      if (field === 'quantity' || field === 'amount') {
        calculateItemProfit(index);
      }
    }
  };

  const addSaleItem = () => {
    setSaleItems([
      ...saleItems,
      {
        itemId: '',
        quantity: 1,
        amount: 0,
        profit: 0,
        selectedItem: null
      }
    ]);
  };

  const removeSaleItem = (index) => {
    if (saleItems.length > 1) {
      const updatedItems = saleItems.filter((_, i) => i !== index);
      setSaleItems(updatedItems);
    } else {
      alert('Sale must have at least one item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate
    for (let i = 0; i < saleItems.length; i++) {
      const item = saleItems[i];
      if (!item.itemId) {
        alert(`Please select an item for row ${i + 1}`);
        return;
      }
      if (item.quantity <= 0) {
        alert(`Quantity must be greater than 0 for row ${i + 1}`);
        return;
      }
      if (item.amount <= 0) {
        alert(`Amount must be greater than 0 for row ${i + 1}`);
        return;
      }
      if (item.selectedItem && item.quantity > item.selectedItem.quantity) {
        alert(`Insufficient quantity for ${item.selectedItem.name || 'item'}. Available: ${item.selectedItem.quantity}, Requested: ${item.quantity}`);
        return;
      }
    }

    setLoading(true);
    try {
      const saleData = {
        items: saleItems.map(item => ({
          itemId: parseInt(item.itemId),
          quantity: item.quantity,
          profit: item.profit,
          amount: item.amount
        }))
      };

      await salesApi.create(saleData);
      navigate('/sales');
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Failed to create sale: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const itemOptions = items.map(item => ({ 
    value: item.id, 
    label: item.name ? `${item.name} (ID: ${item.id}, Qty: ${item.quantity})` : `Item #${item.id} (Qty: ${item.quantity})` 
  }));

  const totalAmount = saleItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalProfit = saleItems.reduce((sum, item) => sum + (item.profit || 0), 0);

  return (
    <div>
      <Navigation />
      <RequireShop block>
      <FormWrapper title="Create Sale" onSubmit={handleSubmit}>
        <div className="sale-items-container">
          <div className="sale-items-header">
            <h3>Sale Items</h3>
            <button type="button" onClick={addSaleItem} className="add-item-button">
              + Add Item
            </button>
          </div>

          {saleItems.map((saleItem, index) => (
            <div key={index} className="sale-item-row">
              <div className="sale-item-header">
                <h4>Item {index + 1}</h4>
                {saleItems.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeSaleItem(index)} 
                    className="remove-item-button"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-fields-row">
                <FormField label="Item" htmlFor={`item-${index}`} required>
                  <Input
                    type="dropdown"
                    name="itemId"
                    placeholder="Select Item"
                    value={saleItem.itemId}
                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                    options={itemOptions}
                  />
                </FormField>
                <FormField label="Quantity" htmlFor={`quantity-${index}`} required>
                  <Input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={saleItem.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    min="1"
                    max={saleItem.selectedItem?.quantity || 999999}
                  />
                </FormField>
              </div>

              {saleItem.selectedItem && (
                <div className="item-info-box">
                  <div><strong>Item:</strong> {saleItem.selectedItem.name || `Item #${saleItem.selectedItem.id}`}</div>
                  <div><strong>Available Quantity:</strong> {saleItem.selectedItem.quantity}</div>
                  <div><strong>FIFO Cost (next out):</strong> {typeof saleItem.selectedItem.purchasePrice === 'string' 
                    ? parseFloat(saleItem.selectedItem.purchasePrice).toFixed(2) 
                    : (saleItem.selectedItem.purchasePrice?.toFixed(2) || '0.00')}
                  </div>
                  <div>Profit is estimated from FIFO cost and finalized on save.</div>
                </div>
              )}

              <div className="form-fields-row">
                <FormField label="Amount" htmlFor={`amount-${index}`} required>
                  <Input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={saleItem.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </FormField>
                <FormField label="Profit" htmlFor={`profit-${index}`}>
                  <Input
                    type="number"
                    name="profit"
                    placeholder="Profit (Auto-calculated)"
                    value={saleItem.profit || 0}
                    disabled={true}
                    step="0.01"
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>

        <div className="sale-totals">
          <div className="total-row">
            <strong>Total Amount:</strong> {totalAmount.toFixed(2)}
          </div>
          <div className="total-row">
            <strong>Total Profit:</strong> {totalProfit.toFixed(2)}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/sales')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Sale'}
          </button>
        </div>
      </FormWrapper>
      </RequireShop>
    </div>
  );
};

export default SaleCreate;