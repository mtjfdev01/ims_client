import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Input from '../../components/Input';
import PermissionLink from '../../components/PermissionLink';
import { servicesApi } from '../../services/api';
import { FREQUENCY_LABELS, money, moneyText, paymentLabel, SERVICE_KIND_LABELS, todayIso } from '../sales/salePayment';
import { hasPermission } from '../../services/session';
import '../../components/SingleView.css';
import '../sales/SaleView.css';

const ServiceView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
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
      setJob(await servicesApi.getOne(id));
    } catch (error) {
      setJob(null);
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
    if (amount > money(job.balance) + 0.001) {
      alert(`Payment exceeds remaining balance of ${moneyText(job.balance)}`);
      return;
    }
    setSaving(true);
    try {
      const updated = await servicesApi.addPayment(id, {
        amount,
        paidOn: paymentForm.paidOn || todayIso(),
        notes: paymentForm.notes.trim() || undefined,
      });
      setJob(updated);
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
        <div className="single-view-container"><p>Loading...</p></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <Navigation />
        <div className="single-view-container">
          <p>Item not found</p>
          <button onClick={() => navigate('/services')} className="single-view-button">Back to List</button>
        </div>
      </div>
    );
  }

  const remaining = money(job.balance);
  const canWrite = hasPermission('services.write');
  const payments = Array.isArray(job.payments) ? job.payments : [];

  return (
    <div>
      <Navigation />
      <div className="single-view-container">
        <div className="single-view-header">
          <h1>Service Details</h1>
          <div className="single-view-actions">
            <button onClick={() => navigate('/services')} className="single-view-button">Back</button>
            {canWrite && (
              <button onClick={() => navigate(`/services/${id}/edit`)} className="single-view-button single-view-button-primary">Edit</button>
            )}
          </div>
        </div>
        <div className="single-view-content">
          <div className="single-view-field">
            <label className="single-view-label">Service:</label>
            <div className="single-view-value">{job.title}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Type:</label>
            <div className="single-view-value">{SERVICE_KIND_LABELS[job.kind] || job.kind}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Customer:</label>
            <div className="single-view-value">
              {job.customer
                ? (
                  <>
                    <PermissionLink module="customers" to={`/customers/${job.customer.id}`}>{job.customer.name}</PermissionLink>
                    {job.customer.phone ? ` (${job.customer.phone})` : ''}
                  </>
                )
                : 'Walk-in'}
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Payment:</label>
            <div className="single-view-value">
              <span className={`payment-badge payment-badge-${job.paymentStatus || 'completed'}`}>
                {paymentLabel(job.paymentStatus)}
              </span>
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Amount / Profit:</label>
            <div className="single-view-value">{moneyText(job.amount)}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Amount Paid:</label>
            <div className="single-view-value">{moneyText(job.amountPaid)}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Balance:</label>
            <div className="single-view-value">{moneyText(remaining)}</div>
          </div>
          {job.notes && (
            <div className="single-view-field">
              <label className="single-view-label">Notes:</label>
              <div className="single-view-value">{job.notes}</div>
            </div>
          )}
          {job.promiseDate && (
            <div className="single-view-field">
              <label className="single-view-label">Promise Date:</label>
              <div className="single-view-value">{job.promiseDate}</div>
            </div>
          )}
          {job.installmentFrequency && job.installmentFrequency !== 'none' && (
            <>
              <div className="single-view-field">
                <label className="single-view-label">Installment:</label>
                <div className="single-view-value">
                  {FREQUENCY_LABELS[job.installmentFrequency] || job.installmentFrequency}
                  {job.installmentAmount != null ? ` · ${moneyText(job.installmentAmount)}` : ''}
                </div>
              </div>
              <div className="single-view-field">
                <label className="single-view-label">Next Due:</label>
                <div className="single-view-value">{job.nextDueDate || '—'}</div>
              </div>
            </>
          )}
          <div className="single-view-field">
            <label className="single-view-label">Date:</label>
            <div className="single-view-value">
              {job.createdAt
                ? `${new Date(job.createdAt).toLocaleDateString()} ${new Date(job.createdAt).toLocaleTimeString()}`
                : 'N/A'}
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Payment history:</label>
            <div className="single-view-value">
              {payments.length === 0 ? 'No recorded payments' : (
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

        {hasPermission('services.write') && remaining > 0.001 && (
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

export default ServiceView;
