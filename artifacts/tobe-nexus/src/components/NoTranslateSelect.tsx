"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleOpen() {
    if (disabled) return;
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
    }
    setOpen((o) => !o);
  }

  return (
    <div className={`relative ${className}`} translate="no" lang="zh-Hans">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
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

      {open && typeof window !== "undefined" &&
        createPortal(
          <div
            translate="no"
            lang="zh-Hans"
            style={{
              position: "absolute",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
            }}
            className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
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
                className={`w-full px-3 py-2 text-sm text-left text-glacier-300 hover:bg-slate-50 transition-colors ${
                  opt.value === value ? "font-semibold text-glacier-200 bg-slate-50" : ""
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
