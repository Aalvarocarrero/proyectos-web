import type { ReactNode } from "react";

type Row = { id: string; cells: ReactNode[] };

/** Compact screens get labelled records; wider screens keep comparable columns. */
export function TechnicalDataTable({ label, columns, rows, empty }: {
  label: string; columns: string[]; rows: Row[]; empty: string;
}) {
  if (!rows.length) return <p className="mt-4 min-w-0 rounded-xl border border-[#3e2a19]/12 p-5 text-sm leading-6 text-[#71685f] [overflow-wrap:anywhere]">{empty}</p>;
  return <div className="mt-4 min-w-0 max-w-full">
    <div className="space-y-3 sm:hidden" aria-label={label}>
      {rows.map(row => <dl key={row.id} className="grid min-w-0 grid-cols-2 gap-3 rounded-xl border border-[#3e2a19]/12 bg-[#fbf8f2] p-3">
        {columns.map((column, index) => <div key={column} className="min-w-0">
          <dt className="text-xs font-semibold text-[#71685f]">{column}</dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums [overflow-wrap:anywhere]">{row.cells[index]}</dd>
        </div>)}
      </dl>)}
    </div>
    <div role="region" aria-label={label} tabIndex={0} className="hidden w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-[#3e2a19]/12 sm:block">
      <table className="w-full min-w-[32.5rem] text-sm"><caption className="sr-only">{label}</caption>
        <thead className="bg-[#f3ebdd] text-left"><tr>{columns.map(column => <th key={column} scope="col" className="p-3">{column}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t border-[#3e2a19]/8">{row.cells.map((cell,index) => <td key={columns[index]} className="p-3 tabular-nums [overflow-wrap:anywhere]">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </div>;
}
