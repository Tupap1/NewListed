import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import XmlPage from './pages/XmlPage';
import ExcelPage from './pages/ExcelPage';

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 ml-64">
                        {/* Navbar */}
                        <Navbar />

                        {/* Page Content */}
                        <main className="mt-16 p-6">
                            <Routes>
                                {/* Default route redirects to XML vault */}
                                <Route path="/" element={<Navigate to="/xml" replace />} />

                                {/* XML Module - Main dashboard */}
                                <Route path="/xml" element={<XmlPage />} />

                                {/* Excel Module - Reconciliation */}
                                <Route path="/excel" element={<ExcelPage />} />

                                {/* 404 fallback */}
                                <Route path="*" element={<Navigate to="/xml" replace />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
