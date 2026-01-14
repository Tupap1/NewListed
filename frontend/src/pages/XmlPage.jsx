import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCcw, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import FileUpload from '../components/ui/FileUpload';
import DataTable from '../components/ui/DataTable';

export default function XmlPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadStats, setUploadStats] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [kpi, setKpi] = useState({ count: 0, total: 0 });

    const fetchInvoices = async (p = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/xml/list?page=${p}&per_page=10`);
            setInvoices(res.data.items);
            setTotalPages(res.data.pages);
            setPage(res.data.current_page);

            // Simple calc (in real app, fetch from specialized endpoint)
            setKpi({
                count: res.data.total,
                total: res.data.items.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) // Only page sum, but ok for demo
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleUpload = async (files) => {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));

        try {
            const res = await axios.post('/api/xml/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadStats(res.data);
            fetchInvoices(1); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/xml/export', {
                responseType: 'blob'
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'invoices_export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Export failed");
        }
    };

    const columns = [
        {
            header: "No. Factura",
            accessor: "invoice_number",
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-white">
                        {r.invoice_number || r.uuid?.substring(0, 12)}
                    </span>
                    <span className="text-xs font-mono text-slate-600" title={r.uuid}>
                        UUID: {r.uuid?.substring(0, 8)}...
                    </span>
                </div>
            )
        },
        { header: "Fecha", accessor: "issue_date" },
        { header: "Emisor (NIT)", accessor: "issuer_nit" },
        { header: "Receptor", accessor: "receiver_name", render: (r) => <span className="truncate max-w-[150px] inline-block">{r.receiver_name}</span> },
        {
            header: "Total",
            accessor: "total_amount",
            render: (r) => <span className="text-emerald-400 font-mono font-medium">${r.total_amount?.toLocaleString()}</span>
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">XML Vault</h2>
                    <p className="text-slate-400 mt-2">Colombian DIAN Invoices Repository</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors"
                    >
                        <Download size={18} />
                        Export to Excel
                    </button>
                    <button
                        onClick={() => fetchInvoices(page)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-kpi bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Stored</h3>
                    <p className="text-4xl font-bold text-white mt-2">{kpi.count} <span className="text-lg text-slate-500 font-normal">invoices</span></p>
                </div>
                <div className="card-kpi bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Page Value</h3>
                    <p className="text-4xl font-bold text-emerald-400 mt-2">${kpi.total.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <span className="text-xs text-slate-500">Upload Status</span>
                    {uploadStats ? (
                        <div className="mt-2 space-y-1">
                            <p className="text-emerald-500 flex items-center gap-2"><CheckCircle size={14} /> {uploadStats.uploaded} uploaded</p>
                            <p className="text-slate-400 text-xs">{uploadStats.skipped} skipped</p>
                            {uploadStats.errors > 0 && <p className="text-red-400 flex items-center gap-2"><AlertTriangle size={14} /> {uploadStats.errors} errors</p>}
                        </div>
                    ) : (
                        <p className="text-slate-600 mt-1">Waiting for upload...</p>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-800 sticky top-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Ingest XMLs</h3>
                        <FileUpload onUpload={handleUpload} accept=".xml" multiple={true} label="Upload batches" />
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <DataTable columns={columns} data={invoices} />

                    {/* Pagination Controls */}
                    <div className="flex justify-center gap-2 mt-4">
                        <button
                            disabled={page <= 1}
                            onClick={() => fetchInvoices(page - 1)}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="px-4 py-2 text-slate-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => fetchInvoices(page + 1)}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
