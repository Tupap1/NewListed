import { useState } from 'react';
import axios from '../config/axios';
import FileUpload from '../components/ui/FileUpload';
import DataTable from '../components/ui/DataTable';


export default function ExcelPage() {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (file) => {
        setLoading(true);
        setError(null);
        setData([]);
        setSummary(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/excel/process', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setData(res.data.data);
            setSummary(res.data.summary);
        } catch (err) {
            setError(err.response?.data?.error || "Error processing file");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { header: "Tipo", accessor: "Tipo" },
        { header: "Fecha", accessor: "Fecha" },
        { header: "Folio", accessor: "Folio" },
        {
            header: "Base",
            accessor: "Base",
            render: (row) => <span className="font-mono text-slate-300">{row.Base?.toLocaleString()}</span>
        },
        {
            header: "Impuesto",
            accessor: "Impuesto",
            render: (row) => <span className="font-mono text-slate-300">{row.Impuesto?.toLocaleString()}</span>
        },
        {
            header: "Verif (Ratio)",
            accessor: "Verif",
            render: (row) => (
                <span className={row.Verif === 'CHECK' ? "text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded" : "text-emerald-500"}>
                    {row.Verif}
                </span>
            )
        },
        {
            header: "COMCON",
            accessor: "COMCON",
            render: (row) => (
                <span className={row.COMCON !== 'OK' && row.COMCON !== 'START' ? "text-amber-400 font-bold" : "text-slate-400"}>
                    {row.COMCON}
                </span>
            )
        },
    ];

    const getRowClassName = (row) => {
        if (row.COMCON === 'JUMP DETECTED') return 'bg-red-900/20';
        if (row.COMCON === 'DUPLICATE') return 'bg-amber-900/20';
        return '';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Excel Processing</h2>
                <p className="text-slate-400 mt-2">Upload raw financial reports to normalize and validate data.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Input Data</h3>
                        <FileUpload onUpload={handleUpload} accept=".xlsx, .xls" label="Upload .xlsx" />

                        {loading && <p className="text-indigo-400 mt-4 animate-pulse">Processing...</p>}
                        {error && <p className="text-red-400 mt-4 bg-red-400/10 p-3 rounded">{error}</p>}
                        {summary && (
                            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <p className="text-emerald-400 font-medium">Success!</p>
                                <p className="text-sm text-emerald-500/80">Processed {summary.processed_rows} rows.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-lg font-semibold text-white mb-2">Legend</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500/20 border border-red-500 rounded-full"></span> Verif CHECK: Tax/Base ratio mismatch.</li>
                            <li className="flex items-center gap-2"><span className="w-3 h-3 bg-red-900/40 rounded"></span> Row Red: Jump in folio detected.</li>
                        </ul>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <DataTable
                        columns={columns}
                        data={data}
                        getRowClassName={getRowClassName}
                    />
                </div>
            </div>
        </div>
    );
}
