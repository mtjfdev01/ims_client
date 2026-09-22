import React from 'react';
import Listing from '../../components/Listing';
import { servicesApi } from '../../services/api';
import ServiceFilterPanel from './ServiceFilterPanel';
import { moneyText, paymentLabel, SERVICE_KIND_LABELS } from '../sales/salePayment';
import '../sales/SaleView.css';

const ServiceList = () => {
  const columns = [
    { header: 'Service', accessor: 'title' },
    {
      header: 'Type',
      accessor: 'kind',
      render: (value) => SERVICE_KIND_LABELS[value] || value || 'Other service',
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (value) => value?.name || 'Walk-in',
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (value) => moneyText(value),
    },
    {
      header: 'Profit',
      accessor: 'profit',
      render: (value) => moneyText(value),
    },
    {
      header: 'Paid',
      accessor: 'amountPaid',
      render: (value) => moneyText(value),
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (value) => moneyText(value),
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (value) => (
        <span className={`payment-badge payment-badge-${value || 'completed'}`}>
          {paymentLabel(value)}
        </span>
      ),
    },
    {
      header: 'Due',
      accessor: 'nextDueDate',
      render: (value, row) => value || row.promiseDate || '—',
    },
  ];

  return (
    <Listing
      title="Services"
      columns={columns}
      fetchData={servicesApi.getAll}
      basePath="/services"
      onDelete={servicesApi.delete}
      writePermission="services.write"
      deletePermission="services.delete"
      fetchTotals={servicesApi.getTotals}
      totalsConfig={[
        { key: 'totalAmount', label: 'Service charges', format: 'currency' },
        { key: 'totalProfit', label: 'Service profit', format: 'currency' },
        { key: 'outstanding', label: 'Outstanding', format: 'currency' },
      ]}
      renderFilters={(handleFilterChange, currentFilters, handleClear) => (
        <ServiceFilterPanel
          onFilterChange={handleFilterChange}
          onClear={handleClear}
          currentFilters={currentFilters}
        />
      )}
    />
  );
};

export default ServiceList;
