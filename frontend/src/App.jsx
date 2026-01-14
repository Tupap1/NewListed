import React from 'react';
import FileUpload from './components/FileUpload';

function App() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-semibold text-primary tracking-tight mb-2">
                        CCNsoft Core
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Motor de Normalización Contable
                    </p>
                </header>

                <main className="bg-white/50 backdrop-blur-sm shadow-xl shadow-slate-200/50 rounded-2xl p-8 sm:p-12 border border-white">
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-medium text-slate-700 mb-6 text-center">Importar Factura Electrónica</h2>
                        <FileUpload />
                    </div>
                </main>

                <footer className="mt-12 text-center text-sm text-slate-400">
                    &copy; {new Date().getFullYear()} CCNsoft. Arquitectura Hexagonal Demo.
                </footer>
            </div>
        </div>
    );
}

export default App;
