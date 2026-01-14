import { Link, useLocation } from 'react-router-dom';
import { FileSpreadsheet, FileText, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const menuItems = [
        {
            path: '/xml',
            label: 'Facturas XML',
            icon: FileText,
            description: 'Bóveda de facturas electrónicas'
        },
        {
            path: '/excel',
            label: 'Conciliación Excel',
            icon: FileSpreadsheet,
            description: 'Análisis y validación contable'
        }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            {/* Logo / Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                <Link to="/xml" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                        Listed
                    </h1>
                </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                                ${active
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                            <div className="flex-1">
                                <div className={`text-sm font-medium ${active ? 'text-primary-700 dark:text-primary-400' : ''}`}>
                                    {item.label}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                    {item.description}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-500 text-center">
                    Listed v2.0 - DIAN Colombia
                </div>
            </div>
        </aside>
    );
}
