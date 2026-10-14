import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 shadow-xs',
    md: 'text-sm px-4 py-2.5 gap-2 shadow-xs',
    lg: 'text-base px-6 py-3 gap-2.5 shadow-sm',
  };

  const variantClasses = {
    primary:
      'bg-agri-gradient text-white hover:opacity-95 focus:ring-emerald-600 shadow-md hover:shadow-lg active:scale-[0.99]',
    secondary:
      'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 focus:ring-emerald-500',
    outline:
      'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 focus:ring-emerald-500 shadow-2xs',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-xs',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
