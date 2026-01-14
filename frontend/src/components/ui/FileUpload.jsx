import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function FileUpload({ onUpload, accept, multiple = false, label = "Upload File" }) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        const fileList = Array.from(files);
        setSelectedFiles(fileList);
        // Auto upload or wait for button? Let's just pass to parent
        onUpload(multiple ? fileList : fileList[0]);
    };

    const clearFiles = () => {
        setSelectedFiles([]);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <div
                className={clsx(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer",
                    dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleChange}
                />

                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400">
                        <Upload size={24} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-slate-200">{label}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Drag & drop or click to select
                        </p>
                    </div>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    {selectedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-sm text-slate-300 truncate max-w-xs">{f.name}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); clearFiles(); }}
                                className="text-slate-500 hover:text-red-400"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
