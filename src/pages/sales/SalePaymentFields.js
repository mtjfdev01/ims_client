import React from 'react';
import FormField from '../../components/FormField';
import Input from '../../components/Input';
import { FREQUENCY_LABELS, money, moneyText, resolvePaidAmount } from './salePayment';

const SalePaymentFields = ({
  totalAmount,
  customers = [],
  value,
  onChange,
  allowNewCustomer = true,
}) => {
  const update = (field, fieldValue) => onChange({ ...value, [field]: fieldValue });
  const paid = resolvePaidAmount(value, totalAmount);
  const remaining = Math.max(0, money(totalAmount) - paid);
  const isCredit = remaining > 0.001;
  const hasPlan = value.installmentFrequency && value.installmentFrequency !== 'none';
  const customerOptions = [
    { value: '', label: 'Walk-in / no customer' },
    ...customers.map((customer) => ({
      value: customer.id,
      label: customer.phone ? `${customer.name} (${customer.phone})` : customer.name,
    })),
  ];

  return (
    <div className="sale-payment-section">
      <h3>Customer & Payment</h3>
      <p className="sale-payment-hint">
        Leave customer empty for a cash walk-in. Amount paid defaults to the sale total.
        Use a lower amount only when the customer is borrowing or paying later.
      </p>

      <div className="form-fields-row">
        <FormField label="Customer" htmlFor="customerId">
          <Input
            type="dropdown"
            name="customerId"
            placeholder="Walk-in / no customer"
            value={value.customerId}
            onChange={(e) => update('customerId', e.target.value)}
            options={customerOptions}
          />
        </FormField>
      </div>

      {allowNewCustomer && !value.customerId && (
        <div className="form-fields-row">
          <FormField label="Or add customer name" htmlFor="newCustomerName">
            <Input
              type="text"
              name="newCustomerName"
              placeholder="Optional new customer"
              value={value.newCustomerName}
              onChange={(e) => update('newCustomerName', e.target.value)}
            />
          </FormField>
          <FormField label="Phone" htmlFor="newCustomerPhone">
            <Input
              type="text"
              name="newCustomerPhone"
              placeholder="Optional phone"
              value={value.newCustomerPhone}
              onChange={(e) => update('newCustomerPhone', e.target.value)}
            />
          </FormField>
        </div>
      )}

      <div className="form-fields-row">
        <FormField label="Amount paid" htmlFor="amountPaid">
          <Input
            type="number"
            name="amountPaid"
            placeholder={moneyText(totalAmount)}
            value={value.amountPaid}
            onChange={(e) => update('amountPaid', e.target.value)}
            min="0"
            step="0.01"
          />
        </FormField>
        <FormField label="Remaining" htmlFor="remaining">
          <Input
            type="text"
            name="remaining"
            value={moneyText(remaining)}
            disabled
          />
        </FormField>
      </div>

      {isCredit && (
        <>
          <div className="form-fields-row">
            <FormField label="Promise / first due date" htmlFor="promiseDate" required={!hasPlan}>
              <Input
                type="date"
                name="promiseDate"
                value={value.promiseDate}
                onChange={(e) => update('promiseDate', e.target.value)}
              />
            </FormField>
            <FormField label="Installment plan" htmlFor="installmentFrequency">
              <Input
                type="dropdown"
                name="installmentFrequency"
                value={value.installmentFrequency}
                onChange={(e) => update('installmentFrequency', e.target.value || 'none')}
                options={Object.entries(FREQUENCY_LABELS).map(([freq, label]) => ({
                  value: freq,
                  label,
                }))}
              />
            </FormField>
          </div>
          {hasPlan && (
            <div className="form-fields-row">
              <FormField label="Installment amount" htmlFor="installmentAmount" required>
                <Input
                  type="number"
                  name="installmentAmount"
                  placeholder="Amount due each period"
                  value={value.installmentAmount}
                  onChange={(e) => update('installmentAmount', e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </FormField>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalePaymentFields;
