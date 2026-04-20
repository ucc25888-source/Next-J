"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface NoTranslateSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function NoTranslateSelect({
  value,
  onChange,
  options,
  placeholder = "請選擇",
  disabled,
  className = "",
}: NoTranslateSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref} translate="no" lang="zh-Hans">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer"
        } ${open ? "border-slate-300" : ""}`}
      >
        <span className={selected ? "text-glacier-200" : "text-glacier-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-100 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              lang="zh-Hans"
              translate="no"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm text-left transition-colors text-glacier-300 hover:bg-slate-50 ${
                opt.value === value ? "font-semibold text-glacier-200 bg-slate-50" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
