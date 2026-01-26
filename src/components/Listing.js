import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from './Table';
import Navigation from './Navigation';
import Pagination from './Pagination';
import FilterPanel from './FilterPanel';
import './Listing.css';

const Listing = ({ 
  title, 
  columns, 
  fetchData, 
  basePath,
  onDelete,
  showFilters = true,
  renderFilters,
  fetchTotals,
  totalsConfig
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [totals, setTotals] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadData(pagination.page, pagination.limit, filters);
  }, []);

  useEffect(() => {
    if (fetchTotals) {
      loadTotals(filters);
    }
  }, [filters, fetchTotals]);

  const loadData = async (page = 1, limit = 10, currentFilters = {}) => {
    try {
      setLoading(true);
      const result = await fetchData(page, limit, currentFilters);
      
      if (result.data && result.total !== undefined) {
        // Paginated response
        setData(result.data);
        setPagination({
          page: result.page || page,
          limit: result.limit || limit,
          total: result.total || 0,
          totalPages: result.totalPages || 0,
        });
      } else {
        // Non-paginated response (fallback)
        setData(Array.isArray(result) ? result : []);
        setPagination({
          page: 1,
          limit: limit,
          total: Array.isArray(result) ? result.length : 0,
          totalPages: 1,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTotals = async (currentFilters = {}) => {
    if (!fetchTotals) return;
    try {
      const result = await fetchTotals(currentFilters);
      setTotals(result);
    } catch (error) {
      console.error('Error loading totals:', error);
      setTotals(null);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reset to page 1 when filters change
    loadData(1, pagination.limit, newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    loadData(1, pagination.limit, {});
  };

  const handlePageChange = (newPage) => {
    loadData(newPage, pagination.limit, filters);
  };

  const handleCreate = () => {
    navigate(`${basePath}/create`);
  };

  const handleView = (id) => {
    navigate(`${basePath}/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`${basePath}/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (onDelete) {
          await onDelete(id);
        }
        await loadData(pagination.page, pagination.limit);
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Failed to delete item');
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="listing-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="listing-container">
        <div className="listing-header">
          <h1>{title}</h1>
          <button onClick={handleCreate} className="listing-create-button">
            Create New
          </button>
        </div>
        {showFilters && renderFilters && (
          <div className="listing-filters">
            {renderFilters(handleFilterChange, filters)}
          </div>
        )}
        {showFilters && !renderFilters && (
          <FilterPanel
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        )}
        <Table
          columns={columns}
          data={data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
        {pagination.total > 0 && (
          <div className="pagination-info">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
        )}
        {totals && totalsConfig && (
          <div className="listing-totals">
            {totalsConfig.map((config, index) => {
              const value = totals[config.key];
              const displayValue = typeof value === 'number' 
                ? (config.format === 'currency' 
                  ? `${value.toFixed(2)}` 
                  : value.toFixed(config.decimals || 2))
                : value || '0.00';
              return (
                <div key={index} className="total-item">
                  <span className="total-label">{config.label}:</span>
                  <span className="total-value">{displayValue}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Listing;

