export default function Table({ columns, rows, sortBy, order, onSort, onRowClick }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} onClick={() => c.sortable !== false && onSort(c.key)}
                style={{ cursor: c.sortable === false ? 'default' : 'pointer' }}>
              {c.label} {sortBy === c.key ? (order === 'asc' ? '▲' : '▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && <tr><td colSpan={columns.length}>No records found</td></tr>}
        {rows.map((r) => (
          <tr key={r.id} onClick={() => onRowClick?.(r)}>
            {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}