import { clsx } from "clsx";

/**
 * @param {Array} columns - [{ header: "Name", accessor: "name", render: (row) => ... }]
 * @param {Array} data - Array of objects
 * @param {Function} getRowClassName - (row) => string
 */
export default function DataTable({ columns, data, getRowClassName }) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/25 rounded-lg border border-slate-300 dark:border-slate-700 border-dashed">
                No hay datos para mostrar
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-900 text-xs uppercase text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className="px-6 py-4 whitespace-nowrap">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-800/50">
                    {data.map((row, rowIdx) => (
                        <tr
                            key={rowIdx}
                            className={clsx(
                                "hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors",
                                getRowClassName ? getRowClassName(row) : ""
                            )}
                        >
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className="px-6 py-4">
                                    {col.render
                                        ? col.render(row)
                                        : (row[col.accessor] !== null && row[col.accessor] !== undefined ? row[col.accessor] : '-')
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
