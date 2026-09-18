import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { ordersApi, itemsApi } from '../../services/api';
import './OrderCreate.css';

const OrderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orderItems, setOrderItems] = useState([
    {
      itemId: '',
      quantity: 1,
      amount: 0,
      selectedItem: null
    }
  ]);
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [returnItems, setReturnItems] = useState({});
  const [returningItems, setReturningItems] = useState(false);

  useEffect(() => {
    loadData();
    loadItems();
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const data = await ordersApi.getOne(id);
      
      if (data.orderItems && data.orderItems.length > 0) {
        const mappedItems = data.orderItems.map(orderItem => ({
          itemId: orderItem.item?.id || orderItem.itemId || '',
          quantity: orderItem.quantity || 1,
          amount: typeof orderItem.amount === 'string' ? parseFloat(orderItem.amount) || 0 : (orderItem.amount || 0),
          selectedItem: orderItem.item || null
        }));
        setOrderItems(mappedItems);
        
        // Initialize return items state
        const returnState = {};
        data.orderItems.forEach(orderItem => {
          if (orderItem.item) {
            returnState[orderItem.item.id] = orderItem.returnedQuantity || 0;
          }
        });
        setReturnItems(returnState);
      }
      
      if (data.status) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadItems = async () => {
    try {
      const data = await itemsApi.getAll();
      const itemsArray = Array.isArray(data) ? data : (data.data || []);
      setItems(itemsArray);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadItemDetails = async (itemId, index) => {
    try {
      const item = await itemsApi.getOne(itemId);
      const updatedItems = [...orderItems];
      updatedItems[index].selectedItem = item;
      
      // Auto-calculate amount when item is selected
      if (item && item.purchasePrice && updatedItems[index].quantity > 0) {
        const purchasePrice = typeof item.purchasePrice === 'string' 
          ? parseFloat(item.purchasePrice) 
          : (item.purchasePrice || 0);
        updatedItems[index].amount = calculateAmount(updatedItems[index].quantity, purchasePrice);
      }
      
      setOrderItems(updatedItems);
    } catch (error) {
      console.error('Error loading item details:', error);
    }
  };

  const calculateAmount = (quantity, purchasePrice) => {
    if (!quantity || !purchasePrice) return 0;
    return parseFloat((quantity * purchasePrice).toFixed(2));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][field] = field === 'quantity' || field === 'amount' 
      ? (parseFloat(value) || 0) 
      : value;

    if (field === 'itemId') {
      updatedItems[index].selectedItem = null;
      updatedItems[index].amount = 0;
      setOrderItems(updatedItems);
      if (value) {
        loadItemDetails(value, index);
      }
    } else if (field === 'quantity') {
      // Auto-calculate amount when quantity changes
      const item = updatedItems[index].selectedItem;
      if (item && item.purchasePrice) {
        const purchasePrice = typeof item.purchasePrice === 'string' 
          ? parseFloat(item.purchasePrice) 
          : (item.purchasePrice || 0);
        updatedItems[index].amount = calculateAmount(parseFloat(value) || 0, purchasePrice);
      }
      setOrderItems(updatedItems);
    } else {
      setOrderItems(updatedItems);
    }
  };

  const handleReturnQuantity = (itemId, value) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: parseFloat(value) || 0
    }));
  };

  const processReturnItems = async () => {
    // Get current order data to find existing returned quantities
    const currentOrderData = await ordersApi.getOne(id);
    const itemsToReturn = Object.entries(returnItems).filter(([itemId, qty]) => qty > 0);
    
    if (itemsToReturn.length === 0) {
      return; // No items to return
    }

    setReturningItems(true);
    try {
      // Process each return item
      // Note: returnItems API adds incrementally, so we calculate the increment needed
      for (const [itemId, newReturnQty] of itemsToReturn) {
        const itemIdNum = parseInt(itemId);
        
        // Find existing order item to get current returned quantity
        const existingOrderItem = currentOrderData.orderItems?.find(oi => 
          oi.item?.id === itemIdNum || oi.itemId === itemIdNum
        );
        
        if (existingOrderItem) {
          const existingReturnedQty = existingOrderItem.returnedQuantity || 0;
          const increment = newReturnQty - existingReturnedQty;
          
          // Only process if there's an increment to add
          if (increment > 0) {
            await ordersApi.returnItems(id, itemIdNum, increment);
          }
        }
      }
      
      // Reload order data to sync quantities and get updated returnedQuantity
      await loadData();
      await loadItems();
    } catch (error) {
      console.error('Error processing return items:', error);
      throw error; // Re-throw to be handled by handleSubmit
    } finally {
      setReturningItems(false);
    }
  };

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        itemId: '',
        quantity: 1,
        amount: 0,
        selectedItem: null
      }
    ]);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(updatedItems);
    } else {
      alert('Order must have at least one item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || returningItems) return;

    // Validate
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.itemId) {
        alert(`Please select an item for row ${i + 1}`);
        return;
      }
      if (item.quantity <= 0) {
        alert(`Quantity must be greater than 0 for row ${i + 1}`);
        return;
      }
      if (item.amount < 0) {
        alert(`Amount cannot be negative for row ${i + 1}`);
        return;
      }
      if (item.selectedItem && item.quantity > item.selectedItem.quantity) {
        alert(`Insufficient quantity for ${item.selectedItem.name || 'item'}. Available: ${item.selectedItem.quantity}, Requested: ${item.quantity}`);
        return;
      }
    }

    setLoading(true);
    try {
      // First, process all return items (if any)
      await processReturnItems();
      
      // Reload order data to get updated quantities after returns
      await loadData();
      
      // Now update the order with current state
      const orderData = {
        items: orderItems.map(item => {
          const itemId = parseInt(item.itemId);
          return {
            itemId: itemId,
            quantity: item.quantity,
            amount: item.amount
            // Note: returnedQuantity is now handled separately via returnItems API
          };
        }),
        status: status
      };

      await ordersApi.update(id, orderData);
      navigate('/orders');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div>
        <Navigation />
        <div className="form-wrapper-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const itemOptions = items.map(item => ({ 
    value: item.id, 
    label: item.name ? `${item.name} (ID: ${item.id}, Qty: ${item.quantity})` : `Item #${item.id} (Qty: ${item.quantity})` 
  }));

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const totalAmount = orderItems.reduce((sum, item) => {
    const amount = typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : (item.amount || 0);
    return sum + amount;
  }, 0);

  return (
    <div>
      <Navigation />
      <FormWrapper title="Edit Order" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Status" htmlFor="status" required>
            <Input
              type="dropdown"
              name="status"
              placeholder="Select Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
            />
          </FormField>
        </div>

        <div className="order-items-container">
          <div className="order-items-header">
            <h3>Order Items</h3>
            <button type="button" onClick={addOrderItem} className="add-item-button">
              + Add Item
            </button>
          </div>

          {orderItems.map((orderItem, index) => {
            const itemId = orderItem.itemId || orderItem.selectedItem?.id;
            const returnedQty = returnItems[itemId] || 0;
            const issuedQty = orderItem.quantity || 0;
            const netQty = issuedQty - returnedQty;

            return (
              <div key={index} className="order-item-row">
                <div className="order-item-header">
                  <h4>Item {index + 1}</h4>
                  {orderItems.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeOrderItem(index)} 
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
                      value={orderItem.itemId}
                      onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                      options={itemOptions}
                    />
                  </FormField>
                  <FormField label="Quantity" htmlFor={`quantity-${index}`} required>
                    <Input
                      type="number"
                      name="quantity"
                      placeholder="Quantity"
                      value={orderItem.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="1"
                      max={orderItem.selectedItem?.quantity || 999999}
                    />
                  </FormField>
                </div>

                {orderItem.selectedItem && (
                  <div className="item-info-box">
                    <div><strong>Item:</strong> {orderItem.selectedItem.name || `Item #${orderItem.selectedItem.id}`}</div>
                    <div><strong>Available Quantity:</strong> {orderItem.selectedItem.quantity}</div>
                    <div><strong>Issued Quantity:</strong> {issuedQty}</div>
                    <div><strong>Returned Quantity:</strong> {returnedQty}</div>
                    <div><strong>Net Quantity (Issued - Returned):</strong> {netQty}</div>
                  </div>
                )}

                {orderItem.selectedItem && itemId && (
                  <div className="form-fields-row" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                    <FormField label="Return Quantity (will be processed on update)" htmlFor={`return-${index}`}>
                      <Input
                        type="number"
                        name="returnQuantity"
                        placeholder="Quantity to return"
                        value={returnItems[itemId] !== undefined && returnItems[itemId] !== null ? returnItems[itemId] : ''}
                        onChange={(e) => handleReturnQuantity(itemId, e.target.value)}
                        min={0}
                        max={issuedQty}
                        disabled={loading || returningItems}
                      />
                    </FormField>
                  </div>
                )}

                <div className="form-fields-row">
                  <FormField label="Amount (Auto-calculated)" htmlFor={`amount-${index}`}>
                    <Input
                      type="number"
                      name="amount"
                      placeholder="Amount (Auto-calculated)"
                      value={orderItem.amount}
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      step="0.01"
                      min="0"
                      disabled={true}
                    />
                  </FormField>
                </div>
              </div>
            );
          })}
        </div>

        <div className="order-totals">
          <div className="total-row">
            <strong>Total Amount:</strong> {totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/orders')} className="form-button form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="form-button form-button-primary" disabled={loading || returningItems}>
            {returningItems ? 'Processing Returns...' : loading ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default OrderEdit;
