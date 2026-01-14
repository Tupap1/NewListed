import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export const Button = ({
    variant = 'primary', // primary, secondary, danger, ghost
    size = 'md', // sm, md, lg
    isLoading = false,
    className,
    children,
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
        danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-500",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};
