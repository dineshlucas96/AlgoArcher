import React, { useState, useMemo } from 'react';

export default function DataTable({
  columns = [],
  data = [],
  searchKey = '',
  searchPlaceholder = 'Search records…',
  initialPageSize = 10,
  onRowClick = null,
  emptyIcon = '📋',
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items to display.',
  customActions = null,
}) {
  const [search, setSearch]       = useState('');
  const [sortKey, setSortKey]     = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(initialPageSize);

  // Filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase().trim();
    return data.filter(item => {
      return Object.values(item).some(val => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, search]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();

      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = sortedData.slice(startIndex, startIndex + pageSize);

  function handleSort(key) {
    if (sortKey === key) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }

  return (
    <div className="table-container">
      {/* Table toolbar */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240, maxWidth: 380 }}>
          <div className="input-wrapper" style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              🔍
            </span>
            <input
              type="text"
              className="input"
              style={{ paddingLeft: 36, fontSize: '0.85rem' }}
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {customActions}
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table body */}
      {pageItems.length === 0 ? (
        <div className="empty-state" style={{ padding: '48px 20px' }}>
          <div className="empty-state-icon">{emptyIcon}</div>
          <h3>{emptyTitle}</h3>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{
                        width: col.width,
                        textAlign: col.align || 'left',
                        cursor: col.sortable !== false ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                    >
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
                        width: '100%',
                      }}>
                        <span>{col.label}</span>
                        {col.sortable !== false && (
                          <span style={{ fontSize: '0.7rem', color: isSorted ? 'var(--navy)' : 'var(--text-muted)' }}>
                            {isSorted ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item, rowIdx) => (
                <tr
                  key={item.id || item.reg_no || rowIdx}
                  onClick={() => onRowClick && onRowClick(item)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(item[col.key], item, rowIdx) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination bar */}
      {totalItems > 0 && (
        <div className="pagination">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="input select-input"
              style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="pagination-info" style={{ marginLeft: 8 }}>
              {startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)} of {totalItems}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={currentPage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 8px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

