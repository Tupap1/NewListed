import { Link, useLocation } from 'react-router-dom';
import { FileSpreadsheet, FileText, Home } from 'lucide-react';

export default function Navbar() {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800';
    };

    return (
        <nav className="fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4">
            <div className="mb-8 px-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    NewListed
                </h1>
                <p className="text-xs text-slate-500 mt-1">Financial Intelligence</p>
            </div>

            <div className="space-y-2 flex-1">
                <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/')}`}>
                    <Home size={20} />
                    <span className="font-medium">Dashboard</span>
                </Link>
                <Link to="/excel" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/excel')}`}>
                    <FileSpreadsheet size={20} />
                    <span className="font-medium">Excel Processor</span>
                </Link>
                <Link to="/xml" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/xml')}`}>
                    <FileText size={20} />
                    <span className="font-medium">XML Vault</span>
                </Link>
            </div>

            <div className="mt-auto px-4 py-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">Admin</p>
                        <p className="text-xs text-slate-500">System Ops</p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
