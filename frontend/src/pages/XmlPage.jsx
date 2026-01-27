import { useState, useEffect } from 'react';
import axios from '../config/axios';
import { RefreshCcw, CheckCircle, AlertTriangle, Download, Eye, Trash2 } from 'lucide-react';
import FileUpload from '../components/ui/FileUpload';
import DataTable from '../components/ui/DataTable';
import InvoicePreview from '../components/ui/InvoicePreview';


export default function XmlPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadStats, setUploadStats] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

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

            // Calculate KPIs
            setKpi({
                count: res.data.total,
                total: res.data.items.reduce((acc, curr) => acc + (curr.total_amount || 0), 0)
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
            alert("Error al cargar archivos");
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/xml/export', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'facturas_export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Error al exportar");
        }
    };

    const handleDelete = async (invoiceId, invoiceNumber) => {
        const confirmed = window.confirm(
            `¿Estás seguro de eliminar la factura ${invoiceNumber || invoiceId}?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        try {
            await axios.delete(`/api/xml/${invoiceId}`);
            alert("Factura eliminada exitosamente");
            fetchInvoices(page); // Reload current page
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Error al eliminar la factura");
        }
    };

    const columns = [
        {
            header: "No. Factura",
            accessor: "invoice_number",
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {r.invoice_number || r.uuid?.substring(0, 12)}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-500" title={r.uuid}>
                        {r.uuid?.substring(0, 8)}...
                    </span>
                </div>
            )
        },
        {
            header: "Fecha",
            accessor: "issue_date",
            render: (r) => (
                <span className="text-slate-700 dark:text-slate-300">
                    {r.issue_date || 'N/A'}
                </span>
            )
        },
        {
            header: "Emisor",
            accessor: "issuer_name",
            render: (r) => (
                <div className="flex flex-col">
                    <span className="text-slate-900 dark:text-slate-100 font-medium text-sm">
                        {r.issuer_name || 'N/A'}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                        {r.issuer_nit || ''}
                    </span>
                </div>
            )
        },
        {
            header: "Receptor",
            accessor: "receiver_name",
            render: (r) => (
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px] inline-block">
                    {r.receiver_name || 'N/A'}
                </span>
            )
        },
        {
            header: "Total",
            accessor: "total_amount",
            render: (r) => (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                    ${r.total_amount?.toLocaleString()}
                </span>
            )
        },
        {
            header: "Acciones",
            accessor: "id",
            render: (r) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedInvoice(r)}
                        className="p-2 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-800/50 text-primary-700 dark:text-primary-400 rounded-lg transition-colors"
                        title="Ver factura"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(r.id, r.invoice_number || r.uuid?.substring(0, 12))}
                        className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                        title="Eliminar factura"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Bóveda XML</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Repositorio de facturas electrónicas DIAN Colombia
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors shadow-sm"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Exportar Excel</span>
                    </button>
                    <button
                        onClick={() => fetchInvoices(page)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                        title="Refrescar"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-slate-800 border-primary-200 dark:border-primary-700/30 p-6 rounded-xl">
                    <h3 className="text-slate-700 dark:text-slate-300 text-sm font-medium uppercase tracking-wider">
                        Total Almacenado
                    </h3>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2">
                        {kpi.count} <span className="text-lg text-slate-600 dark:text-slate-400 font-normal">facturas</span>
                    </p>
                </div>
                <div className="card p-6 rounded-xl">
                    <h3 className="text-slate-700 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                        Valor de Página
                    </h3>
                    <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                        ${kpi.total.toLocaleString()}
                    </p>
                </div>
                <div className="card p-6 rounded-xl flex flex-col justify-center items-center text-center">
                    <span className="text-xs text-slate-600 dark:text-slate-500 uppercase mb-2">Estado de Carga</span>
                    {uploadStats ? (
                        <div className="space-y-1">
                            <p className="text-emerald-600 dark:text-emerald-500 flex items-center gap-2 text-sm">
                                <CheckCircle size={14} /> {uploadStats.uploaded} cargadas
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">{uploadStats.skipped} omitidas</p>
                            {uploadStats.errors > 0 && (
                                <p className="text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
                                    <AlertTriangle size={14} /> {uploadStats.errors} errores
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-600">Esperando carga...</p>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <div className="card p-6 rounded-xl sticky top-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                            Cargar XMLs
                        </h3>
                        <FileUpload onUpload={handleUpload} accept=".xml" multiple={true} label="Subir lotes" />
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <DataTable columns={columns} data={invoices} />

                    {/* Pagination Controls */}
                    <div className="flex justify-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => fetchInvoices(page - 1)}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-slate-600 dark:text-slate-400">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => fetchInvoices(page + 1)}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice Preview Modal */}
            {selectedInvoice && (
                <InvoicePreview
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
}
