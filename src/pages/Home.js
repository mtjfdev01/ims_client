import React, { useCallback, useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { expensesApi, purchasesApi, salesApi, shopsApi, unwrapList } from '../services/api';
import { useShop } from '../contexts/ShopContext';
import CollapsibleFilters from '../components/CollapsibleFilters';
import '../components/FilterPanel.css';
import './Home.css';

const emptyFilters = {
  date: '',
  dateFrom: '',
  dateTo: '',
};

const money = (value) => Number(value || 0).toFixed(2);

const Home = () => {
  const { selectedShop } = useShop();
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    sales: 0,
    purchases: 0,
    expenses: 0,
    profit: 0,
    stockValue: 0,
  });

  const loadStockValue = useCallback(async () => {
    if (selectedShop?.id) {
      const result = await shopsApi.getAssetValue(selectedShop.id);
      return Number(result?.assetValue || 0);
    }
    const shops = unwrapList(await shopsApi.getAll());
    if (!shops.length) {
      return 0;
    }
    const values = await Promise.all(
      shops.map(async (shop) => {
        try {
          const result = await shopsApi.getAssetValue(shop.id);
          return Number(result?.assetValue || 0);
        } catch (err) {
          return 0;
        }
      })
    );
    return values.reduce((sum, value) => sum + value, 0);
  }, [selectedShop]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    const query = {};
    if (filters.date) {
      query.date = filters.date;
    } else {
      if (filters.dateFrom) query.dateFrom = filters.dateFrom;
      if (filters.dateTo) query.dateTo = filters.dateTo;
    }
    if (selectedShop?.id) {
      query.shopId = selectedShop.id;
    }
    try {
      const [salesTotals, purchaseTotals, expenseTotals, stockValue] = await Promise.all([
        salesApi.getTotals(query, selectedShop?.id),
        purchasesApi.getTotals(query),
        expensesApi.getTotals(query),
        loadStockValue(),
      ]);
      setStats({
        sales: Number(salesTotals?.totalAmount || 0),
        purchases: Number(purchaseTotals?.total || 0),
        expenses: Number(expenseTotals?.total || 0),
        profit: Number(salesTotals?.totalProfit || 0),
        stockValue: Number(stockValue || 0),
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters.date, filters.dateFrom, filters.dateTo, loadStockValue, selectedShop?.id]);

  useEffect(() => {
    loadStats();
    const refresh = () => loadStats();
    window.addEventListener('ims-session', refresh);
    return () => window.removeEventListener('ims-session', refresh);
  }, [loadStats]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'date' && value) {
        next.dateFrom = '';
        next.dateTo = '';
      }
      if ((name === 'dateFrom' || name === 'dateTo') && (value || (name === 'dateFrom' ? next.dateTo : next.dateFrom))) {
        next.date = '';
      }
      return next;
    });
  };

  const handleClear = () => {
    setFilters(emptyFilters);
  };

  const periodLabel = filters.date
    ? `Date: ${filters.date}`
    : (filters.dateFrom || filters.dateTo)
      ? `Range: ${filters.dateFrom || '...'} to ${filters.dateTo || '...'}`
      : 'All time';

  const cards = [
    { key: 'sales', label: 'Sales', value: stats.sales, hint: periodLabel },
    { key: 'purchases', label: 'Purchase', value: stats.purchases, hint: periodLabel },
    { key: 'expenses', label: 'Expense', value: stats.expenses, hint: periodLabel },
    { key: 'profit', label: 'Profit', value: stats.profit, hint: periodLabel },
    { key: 'stockValue', label: 'Stock Value', value: stats.stockValue, hint: 'Current inventory' },
  ];

  return (
    <div>
      <Navigation />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          {selectedShop && (
            <p className="dashboard-shop">Shop: {selectedShop.name}</p>
          )}
        </div>

        <CollapsibleFilters title="Date filter">
          <div className="filter-panel">
            <div className="filter-panel-header">
              <h3>Date filter</h3>
              <button type="button" onClick={handleClear} className="filter-clear-button">Clear</button>
            </div>
            <div className="filter-panel-body">
              <div className="filter-row">
                <div className="filter-field">
                  <label htmlFor="dashboard-date">Specific Date</label>
                  <input
                    type="date"
                    id="dashboard-date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
                <div className="filter-field">
                  <label htmlFor="dashboard-dateFrom">Date From</label>
                  <input
                    type="date"
                    id="dashboard-dateFrom"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
                <div className="filter-field">
                  <label htmlFor="dashboard-dateTo">Date To</label>
                  <input
                    type="date"
                    id="dashboard-dateTo"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleFilters>

        {error && <div className="dashboard-error">{error}</div>}

        <div className="dashboard-cards">
          {cards.map((card) => (
            <div key={card.key} className={`dashboard-card dashboard-card-${card.key}`}>
              <div className="dashboard-card-label">{card.label}</div>
              <div className="dashboard-card-value">{loading ? '...' : money(card.value)}</div>
              <div className="dashboard-card-hint">{card.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
