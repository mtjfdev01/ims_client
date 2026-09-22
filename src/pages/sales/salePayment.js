export const PAYMENT_LABELS = {
  completed: 'Completed',
  pending: 'Pending',
  partial: 'Partially given',
};

export const DUE_LABELS = {
  pending: 'Pending',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

export const SERVICE_KIND_LABELS = {
  repair: 'Repair',
  consultancy: 'Consultancy',
  accessory: 'Accessory / pouch / hands-free',
  other: 'Other service',
};

export const FREQUENCY_LABELS = {
  none: 'No installment',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function money(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function moneyText(value) {
  return money(value).toFixed(2);
}

export function todayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function paymentLabel(status) {
  return PAYMENT_LABELS[status] || status || 'Completed';
}

export function emptyPaymentForm() {
  return {
    customerId: '',
    newCustomerName: '',
    newCustomerPhone: '',
    amountPaid: '',
    promiseDate: '',
    installmentFrequency: 'none',
    installmentAmount: '',
  };
}

export function paymentFormFromSale(sale) {
  return {
    customerId: sale?.customer?.id || '',
    newCustomerName: '',
    newCustomerPhone: '',
    amountPaid: sale?.amountPaid == null ? '' : String(sale.amountPaid),
    promiseDate: sale?.promiseDate || '',
    installmentFrequency: sale?.installmentFrequency || 'none',
    installmentAmount: sale?.installmentAmount == null ? '' : String(sale.installmentAmount),
  };
}

export function resolvePaidAmount(form, totalAmount) {
  if (form.amountPaid === '' || form.amountPaid == null) {
    return money(totalAmount);
  }
  return money(form.amountPaid);
}

export function validatePaymentForm(form, totalAmount) {
  const total = money(totalAmount);
  const paid = resolvePaidAmount(form, total);
  if (paid < 0) {
    return 'Amount paid cannot be negative';
  }
  if (paid > total + 0.001) {
    return 'Amount paid cannot exceed sale total';
  }
  const remaining = Math.max(0, total - paid);
  if (remaining > 0.001) {
    const hasPlan = form.installmentFrequency && form.installmentFrequency !== 'none';
    if (!hasPlan && !form.promiseDate) {
      return 'Promise date is required when payment is pending or partial';
    }
    if (hasPlan) {
      const installment = money(form.installmentAmount);
      if (installment <= 0) {
        return 'Installment amount is required for daily, weekly, or monthly plans';
      }
      if (installment > remaining + 0.001) {
        return 'Installment amount cannot exceed remaining balance';
      }
    }
  }
  return null;
}

export function buildSalePaymentPayload(form, totalAmount, { allowClearCustomer = false } = {}) {
  const payload = {};
  if (form.customerId) {
    payload.customerId = Number(form.customerId);
  } else if (form.newCustomerName?.trim()) {
    payload.newCustomer = {
      name: form.newCustomerName.trim(),
      phone: form.newCustomerPhone?.trim() || undefined,
    };
  } else if (allowClearCustomer) {
    payload.customerId = null;
  }

  const total = money(totalAmount);
  const paid = resolvePaidAmount(form, total);
  payload.amountPaid = paid;
  if (paid + 0.001 < total) {
    if (form.promiseDate) {
      payload.promiseDate = form.promiseDate;
    }
    payload.installmentFrequency = form.installmentFrequency || 'none';
    if (payload.installmentFrequency !== 'none' && form.installmentAmount) {
      payload.installmentAmount = money(form.installmentAmount);
    }
  } else {
    payload.installmentFrequency = 'none';
  }
  return payload;
}
