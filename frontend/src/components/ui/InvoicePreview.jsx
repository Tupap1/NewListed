import { X, Building2, User, Calendar, FileText } from 'lucide-react';
import { useEffect } from 'react';

/**
 * InvoicePreview - Modal para visualizar factura detallada
 * @param {Object} invoice - Objeto de factura con todos los detalles
 * @param {Function} onClose - Función para cerrar el modal
 */
export default function InvoicePreview({ invoice, onClose }) {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!invoice) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                Factura {invoice.invoice_number || invoice.uuid?.substring(0, 12)}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Fecha: {invoice.issue_date || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Cerrar (ESC)"
                    >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Parties Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Emisor */}
                        <div className="card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Emisor</h3>
                            </div>
                            <div className="space-y-1 text-sm">
                                <p className="text-slate-900 dark:text-slate-100 font-medium">
                                    {invoice.issuer_name || 'N/A'}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    NIT: {invoice.issuer_nit || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Receptor */}
                        <div className="card p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Receptor</h3>
                            </div>
                            <div className="space-y-1 text-sm">
                                <p className="text-slate-900 dark:text-slate-100 font-medium">
                                    {invoice.receiver_name || 'N/A'}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    NIT: {invoice.receiver_nit || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {(invoice.payment_form || invoice.payment_method) && (
                        <div className="card p-4">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                Información de Pago
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {invoice.payment_form && (
                                    <div>
                                        <span className="text-slate-600 dark:text-slate-400">Forma:</span>{' '}
                                        <span className="text-slate-900 dark:text-slate-100 font-medium">
                                            {invoice.payment_form}
                                        </span>
                                    </div>
                                )}
                                {invoice.payment_method && (
                                    <div>
                                        <span className="text-slate-600 dark:text-slate-400">Medio:</span>{' '}
                                        <span className="text-slate-900 dark:text-slate-100 font-medium">
                                            {invoice.payment_method}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items Table */}
                    {invoice.items && invoice.items.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                    Productos y Servicios
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Cantidad</th>
                                            <th className="px-4 py-2 text-left">Descripción</th>
                                            <th className="px-4 py-2 text-right">Vr. Unitario</th>
                                            <th className="px-4 py-2 text-left">Impuesto</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {invoice.items.map((item, idx) => {
                                            // Format tax info for this item
                                            let taxDisplay = 'Sin IVA';
                                            if (item.taxes && Object.keys(item.taxes).length > 0) {
                                                taxDisplay = Object.entries(item.taxes)
                                                    .map(([name, value]) => `${name} ($${parseFloat(value).toLocaleString()})`)
                                                    .join(', ');
                                            }

                                            return (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                                                        {item.quantity?.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                                                        {item.description || 'Sin descripción'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">
                                                        ${item.unit_price?.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-xs">
                                                        {taxDisplay}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                                                        ${item.total_line?.toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Totals Section */}
                    <div className="card p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Totales</h3>
                        <div className="space-y-2">
                            {/* Subtotal */}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Subtotal (Base):</span>
                                <span className="text-slate-900 dark:text-slate-100 font-medium">
                                    ${invoice.base_amount?.toLocaleString()}
                                </span>
                            </div>

                            {/* Tax Breakdown */}
                            {invoice.taxes && Object.keys(invoice.taxes).length > 0 && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">
                                            Desglose de Impuestos
                                        </p>
                                        {Object.entries(invoice.taxes).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">{key}:</span>
                                                <span className="text-slate-900 dark:text-slate-100">
                                                    ${parseFloat(value).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Grand Total */}
                            <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-3 mt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-slate-900 dark:text-slate-100">Total a Pagar:</span>
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                        ${invoice.total_amount?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* UUID Reference (Small) */}
                    <div className="text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                            UUID: {invoice.uuid}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
