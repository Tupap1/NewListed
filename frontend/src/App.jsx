import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ExcelPage from './pages/ExcelPage';
import XmlPage from './pages/XmlPage';

function App() {
    return (
        <Router>
            <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
                <Navbar />
                <main className="ml-64 flex-1 p-8">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/excel" element={<ExcelPage />} />
                        <Route path="/xml" element={<XmlPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

// Simple Home Placeholder
function Overview() {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-fade-in">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur opacity-25"></div>
                <h1 className="relative text-5xl font-extrabold text-white">NewListed<span className="text-cyan-400">.</span></h1>
            </div>
            <p className="text-xl text-slate-400 max-w-lg">
                The next-generation financial processing engine.
                Manage your invoices and sanitize your Excel reports in seconds.
            </p>
            <div className="flex gap-4 mt-8">
                <a href="/excel" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Start Excel Job</a>
                <a href="/xml" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors">View XML Vault</a>
            </div>
        </div>
    )
}

export default App;
