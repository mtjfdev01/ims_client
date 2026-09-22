import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import PermissionLink from '../../components/PermissionLink';
import { installmentsApi } from '../../services/api';
import { DUE_LABELS, money, moneyText, paymentLabel, todayIso } from '../sales/salePayment';
import { hasPermission } from '../../services/session';
import '../../components/SingleView.css';
import '../sales/SaleView.css';

const InstallmentPlanView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', paidOn: todayIso(), notes: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      setPlan(await installmentsApi.getPlan(id));
    } catch (error) {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const startPay = (due) => {
    setPayingId(due.id);
    setPayForm({
      amount: moneyText(due.remaining),
      paidOn: todayIso(),
      notes: '',
    });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    const amount = money(payForm.amount);
    if (amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    try {
      await installmentsApi.payDue(payingId, {
        amount,
        paidOn: payForm.paidOn || todayIso(),
        notes: payForm.notes.trim() || undefined,
      });
      setPayingId(null);
      await loadData();
    } catch (error) {
      alert(error.message || 'Failed to record installment');
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

  if (!plan || plan.error) {
    return (
      <div>
        <Navigation />
        <div className="single-view-container">
          <p>Item not found</p>
          <button onClick={() => navigate('/installments')} className="single-view-button">Back to List</button>
        </div>
      </div>
    );
  }

  const dues = Array.isArray(plan.dues) ? plan.dues : [];
  const canWrite = hasPermission('installments.write');
  const scheduleLabel = plan.schedule === 'first_of_month'
    ? '1st of every month'
    : `Day ${plan.dayOfMonth} of every month`;

  return (
    <div>
      <Navigation />
      <div className="single-view-container">
        <div className="single-view-header">
          <h1>Installment Plan</h1>
          <div className="single-view-actions">
            <button onClick={() => navigate('/installments')} className="single-view-button">Back</button>
            {canWrite && (
              <button onClick={() => navigate(`/installments/plans/${id}/edit`)} className="single-view-button single-view-button-primary">Edit</button>
            )}
          </div>
        </div>
        <div className="single-view-content">
          <div className="single-view-field">
            <label className="single-view-label">Title:</label>
            <div className="single-view-value">{plan.title}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Customer:</label>
            <div className="single-view-value">
              {plan.customer
                ? (
                  <>
                    <PermissionLink module="customers" to={`/customers/${plan.customer.id}`}>{plan.customer.name}</PermissionLink>
                    {plan.customer.phone ? ` (${plan.customer.phone})` : ''}
                  </>
                )
                : '—'}
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Shop:</label>
            <div className="single-view-value">{plan.shop?.name || '—'}</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Schedule:</label>
            <div className="single-view-value">{scheduleLabel} · {plan.installmentCount} installments</div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Total / Down / Paid / Balance:</label>
            <div className="single-view-value">
              {moneyText(plan.totalAmount)} / {moneyText(plan.downPayment)} / {moneyText(plan.amountPaid)} / {moneyText(plan.balance)}
            </div>
          </div>
          <div className="single-view-field">
            <label className="single-view-label">Payment:</label>
            <div className="single-view-value">
              <span className={`payment-badge payment-badge-${plan.paymentStatus || 'pending'}`}>
                {paymentLabel(plan.paymentStatus)}
              </span>
              {` · ${plan.completedCount || 0} completed, ${plan.pendingCount || 0} pending, ${plan.upcomingCount || 0} upcoming`}
            </div>
          </div>
          {plan.notes && (
            <div className="single-view-field">
              <label className="single-view-label">Notes:</label>
              <div className="single-view-value">{plan.notes}</div>
            </div>
          )}
          <div className="single-view-field">
            <label className="single-view-label">Installments:</label>
            <div className="single-view-value">
              <div className="sale-items-display">
                <table className="sale-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Due date</th>
                      <th>Amount</th>
                      <th>Paid</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dues.map((due) => (
                      <tr key={due.id}>
                        <td>{due.sequence}</td>
                        <td>{due.dueDate}</td>
                        <td>{moneyText(due.amount)}</td>
                        <td>{moneyText(due.paidAmount)}</td>
                        <td>
                          <span className={`payment-badge payment-badge-${due.status === 'completed' ? 'completed' : due.status === 'upcoming' ? 'partial' : 'pending'}`}>
                            {DUE_LABELS[due.status] || due.status}
                          </span>
                        </td>
                        <td>
                          {canWrite && due.status !== 'completed' && (
                            <button
                              type="button"
                              className="single-view-button single-view-button-primary"
                              onClick={() => startPay(due)}
                            >
                              Collect
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {payingId && (
          <form className="sale-record-payment" onSubmit={handlePay}>
            <h3>Collect installment</h3>
            <div className="form-fields-row">
              <label>
                Amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  required
                />
              </label>
              <label>
                Paid on
                <input
                  type="date"
                  value={payForm.paidOn}
                  onChange={(e) => setPayForm({ ...payForm, paidOn: e.target.value })}
                />
              </label>
              <label>
                Notes
                <input
                  type="text"
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  placeholder="Optional"
                />
              </label>
            </div>
            <button type="submit" className="single-view-button single-view-button-primary">Save payment</button>
            <button type="button" className="single-view-button" onClick={() => setPayingId(null)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InstallmentPlanView;
