import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import FormWrapper from '../../components/FormWrapper';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { ordersApi, itemsApi } from '../../services/api';
import './OrderCreate.css';

const OrderCreate = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await itemsApi.getAll();
      const itemsArray = Array.isArray(data) ? data : (data.data || []);
      setItems(itemsArray);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const calculateAmount = (quantity, purchasePrice) => {
    if (!quantity || !purchasePrice) return 0;
    return parseFloat((quantity * purchasePrice).toFixed(2));
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
    if (loading) return;

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
      const orderData = {
        items: orderItems.map(item => ({
          itemId: parseInt(item.itemId),
          quantity: item.quantity,
          amount: item.amount
        })),
        status: status
      };

      await ordersApi.create(orderData);
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

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
      <FormWrapper title="Create Order" onSubmit={handleSubmit}>
        <div className="form-fields-row">
          <FormField label="Status" htmlFor="status">
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

          {orderItems.map((orderItem, index) => (
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
                <FormField label="Item" htmlFor={`item-${index}`}>
                  <Input
                    type="dropdown"
                    name="itemId"
                    placeholder="Select Item"
                    value={orderItem.itemId}
                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                    options={itemOptions}
                  />
                </FormField>
                <FormField label="Quantity" htmlFor={`quantity-${index}`}>
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
          ))}
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
          <button type="submit" className="form-button form-button-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default OrderCreate;
