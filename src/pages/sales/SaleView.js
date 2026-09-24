import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import PermissionLink from '../../components/PermissionLink';
import { salesApi } from '../../services/api';
import { FREQUENCY_LABELS, money, moneyText, paymentLabel, todayIso } from './salePayment';
import { itemOptionLabel } from '../items/itemCondition';
import { hasPermission } from '../../services/session';
import '../../components/SingleView.css';
import './SaleView.css';

const SaleView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paidOn: todayIso(),
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await salesApi.getOne(id);
      setSale(result);
    } catch (error) {
      console.error('Error loading sale:', error);
      setSale(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = money(paymentForm.amount);
    if (amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    if (amount > money(sale.balance) + 0.001) {
      alert(`Payment exceeds remaining balance of ${moneyText(sale.balance)}`);
      return;
    }
    setSaving(true);
    try {
      const updated = await salesApi.addPayment(id, {
        amount,
        paidOn: paymentForm.paidOn || todayIso(),
        notes: paymentForm.notes.trim() || undefined,
      });
      setSale(updated);
      setPaymentForm({ amount: '', paidOn: todayIso(), notes: '' });
    } catch (error) {
      alert(error.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="single-view-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div>
        <Navigation />
        <div className="single-view-container">
          <p>Item not found</p>
          <button onClick={() => navigate('/sales')} className="single-view-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const remaining = money(sale.balance);
  const canWrite = hasPermission('sales.write');
  const payments = Array.isArray(sale.payments) ? sale.payments : [];

  return (
    <div>
      <Navigation />
      <div className="single-view-container">
        <div className="single-view-header">
          <h1>Sale Details</h1>
          <div className="single-view-actions">
            <button onClick={() => navigate('/sales')} className="single-view-button">
              Back
            </button>
            {canWrite && (
              <button onClick={() => navigate(`/sales/${id}/edit`)} className="single-view-button single-view-button-primary">
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="single-view-content">
          <div className="single-view-field">
            <label className="single-view-label">Customer:</label>
            <div className="single-view-value">
              {sale.customer
                ? (
                  <>
                    <PermissionLink module="customers" to={`/customers/${sale.customer.id}`}>{sale.customer.name}</PermissionLink>
                    {sale.customer.phone ? ` (${sale.customer.phone})` : ''}
                    {sale.customer.email ? ` · ${sale.customer.email}` : ''}
                  </>
                )
                : 'Walk-in'}
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Payment:</label>
            <div className="single-view-value">
              <span className={`payment-badge payment-badge-${sale.paymentStatus || 'completed'}`}>
                {paymentLabel(sale.paymentStatus)}
              </span>
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Total Amount:</label>
            <div className="single-view-value">{moneyText(sale.totalAmount)}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Amount Paid:</label>
            <div className="single-view-value">{moneyText(sale.amountPaid)}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Balance:</label>
            <div className="single-view-value">{moneyText(remaining)}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Total Profit:</label>
            <div className="single-view-value">{moneyText(sale.totalProfit)}</div>
          </div>
          {sale.promiseDate && (
            <div className="single-view-field">
              <label className="single-view-label">Promise Date:</label>
              <div className="single-view-value">{sale.promiseDate}</div>
            </div>
          )}
          {sale.installmentFrequency && sale.installmentFrequency !== 'none' && (
            <>
              <div className="single-view-field">
                <label className="single-view-label">Installment:</label>
                <div className="single-view-value">
                  {FREQUENCY_LABELS[sale.installmentFrequency] || sale.installmentFrequency}
                  {sale.installmentAmount != null ? ` · ${moneyText(sale.installmentAmount)}` : ''}
                </div>
              </div>
              <div className="single-view-field">
                <label className="single-view-label">Next Due:</label>
                <div className="single-view-value">{sale.nextDueDate || '—'}</div>
              </div>
            </>
          )}
          {!sale.installmentFrequency || sale.installmentFrequency === 'none' ? (
            sale.nextDueDate ? (
              <div className="single-view-field">
                <label className="single-view-label">Due Date:</label>
                <div className="single-view-value">{sale.nextDueDate}</div>
              </div>
            ) : null
          ) : null}
          <div className="single-view-field">
            <label className="single-view-label">Date:</label>
            <div className="single-view-value">
              {sale.createdAt
                ? `${new Date(sale.createdAt).toLocaleDateString()} ${new Date(sale.createdAt).toLocaleTimeString()}`
                : 'N/A'}
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Items:</label>
            <div className="single-view-value">
              {!sale.saleItems || sale.saleItems.length === 0 ? (
                'No items'
              ) : (
                <div className="sale-items-display">
                  <table className="sale-items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sale.saleItems.map((saleItem, index) => (
                        <tr key={index}>
                          <td>
                            {itemOptionLabel(saleItem.item)}
                          </td>
                          <td>{saleItem.quantity || 0}</td>
                          <td>{moneyText(saleItem.amount)}</td>
                          <td>{moneyText(saleItem.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Payment history:</label>
            <div className="single-view-value">
              {payments.length === 0 ? (
                'No recorded payments'
              ) : (
                <div className="sale-items-display">
                  <table className="sale-items-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.paidOn || '—'}</td>
                          <td>{moneyText(entry.amount)}</td>
                          <td>{entry.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {canWrite && remaining > 0.001 && (
          <form className="sale-record-payment" onSubmit={handleRecordPayment}>
            <h3>Record payment</h3>
            <div className="form-fields-row">
              <label>
                Amount
                <Input
                  type="number"
                  name="amount"
                  min="0"
                  step="any"
                  max={remaining}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </label>
              <label>
                Paid on
                <input
                  type="date"
                  value={paymentForm.paidOn}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paidOn: e.target.value })}
                />
              </label>
              <label>
                Notes
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional"
                />
              </label>
            </div>
            <button type="submit" className="single-view-button single-view-button-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Add payment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SaleView;
