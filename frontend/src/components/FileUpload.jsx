import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { clsx } from 'clsx';

const FileUpload = () => {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file) => {
        if (file.name.endsWith('.xml')) {
            setFile(file);
            setStatus('idle');
            setMessage('');
        } else {
            setStatus('error');
            setMessage('Por favor, sube solo archivos XML válidos.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Using relative path assuming served from same origin
            const response = await axios.post('/facturas/importar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setStatus('success');
            setMessage(`Factura procesada con éxito. ID: ${response.data.processed_files} archivo(s) procesado(s).`);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.detail || 'Error al conectar con el servidor.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div
                className={clsx(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer bg-white",
                    dragging ? "border-accent bg-blue-50" : "border-slate-300 hover:border-slate-400",
                    status === 'success' && "border-green-500 bg-green-50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {status === 'success' ? (
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                ) : (
                    <UploadCloud className={clsx("w-12 h-12 mb-4", dragging ? "text-accent" : "text-slate-400")} />
                )}

                <h3 className="text-lg font-medium text-primary">
                    {file ? file.name : "Suelta tu XML aquí"}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                    {file ? `${(file.size / 1024).toFixed(2)} KB` : "o haz clic para buscar"}
                </p>
            </div>

            {status === 'error' && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {message}
                </div>
            )}

            {status === 'success' && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {message}
                </div>
            )}

            {file && status !== 'success' && (
                <button
                    onClick={handleUpload}
                    disabled={status === 'uploading'}
                    className={clsx(
                        "mt-6 w-full py-3 px-4 bg-primary text-white font-medium rounded-lg shadow-sm transition-colors",
                        status === 'uploading' ? "opacity-75 cursor-not-allowed" : "hover:bg-primary-hover"
                    )}
                >
                    {status === 'uploading' ? "Procesando..." : "Procesar Factura"}
                </button>
            )}
        </div>
    );
};

export default FileUpload;
