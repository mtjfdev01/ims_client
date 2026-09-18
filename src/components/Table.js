import React from 'react';
import { EyeIcon } from './Input';
import './Table.css';

const Table = ({ columns, data = [], onEdit, onDelete, onView, loading = false, emptyMessage = 'No records yet' }) => {
  return (
    <div className="table-container">
      <table className="common-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="table-empty">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                  </td>
                ))}
                <td className="table-actions">
                  <div className="table-actions-inner">
                    {onView && (
                      <button
                        onClick={() => onView(row.id || rowIndex)}
                        className="table-button table-button-view"
                      >
                        View
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row.id || rowIndex)}
                        className="table-button table-button-edit"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row.id || rowIndex)}
                        className="table-button table-button-delete"
                      >
                        Delete
                      </button>
                    )}
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(row.id || rowIndex)}
                        className="table-button-eye"
                        aria-label="View"
                        title="View"
                      >
                        <EyeIcon />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
