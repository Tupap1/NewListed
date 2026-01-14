import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Page Title / Breadcrumb */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Sistema de Gestión Contable
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Procesamiento inteligente para DIAN Colombia
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    >
                        {isDark ? (
                            <Sun className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <Moon className="w-5 h-5 text-slate-600" />
                        )}
                    </button>

                    {/* User Info (Optional) */}
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Acceso Interno
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Sin autenticación
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
