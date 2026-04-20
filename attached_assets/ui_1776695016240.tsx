import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' }
>(({ className, variant = 'primary', ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm';
  
  const variants = {
    primary: 'bg-amber-500 text-white hover:bg-amber-600',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50',
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn("rounded-xl border bg-white text-slate-950 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }
>(({ className, label, error, ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string, error?: string }
>(({ className, label, error, ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, error?: string, options: { value: string, label: string }[] }
>(({ className, label, error, options, ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      {...props}
    >
      <option value="" disabled>請選擇</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));
Select.displayName = 'Select';

export const CheckboxGroup = ({
  label,
  options,
  selectedValues,
  onChange,
  className,
  maxSelect,
}: {
  label?: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
  maxSelect?: number;
}) => {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const isChecked = selectedValues.includes(opt.value);
          const isDisabled = maxSelect ? selectedValues.length >= maxSelect && !isChecked : false;

          return (
            <label
              key={opt.value}
              className={cn(
                "flex items-center space-x-2 rounded-md border p-3 transition-colors",
                isDisabled ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-100" : "cursor-pointer border-slate-200 hover:bg-slate-50"
              )}
              onClick={(e) => {
                // 防止 label 點擊事件冒泡，因為我們已經在 input 處理 onChange 了
                if (e.target !== e.currentTarget) return;
                if (!isDisabled) handleToggle(opt.value);
              }}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed"
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => {
                  // 只在這裡處理 toggle，不要讓 label 也觸發
                  handleToggle(opt.value);
                }}
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export const ImageUpload = ({
  label,
  value,
  onChange,
  onRemove,
  className,
}: {
  label?: string;
  value?: string;
  onChange: (file: File) => void;
  onRemove: () => void;
  className?: string;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onChange(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div
        className={cn(
          "relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          isDragging ? "border-amber-500 bg-amber-50" : "border-slate-300 hover:bg-slate-50",
          value ? "border-solid border-slate-200" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="rounded-full bg-white p-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            </div>
          </>
        ) : (
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-slate-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <span className="text-xs text-slate-500">點擊或拖曳上傳</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
          </label>
        )}
      </div>
    </div>
  );
};


