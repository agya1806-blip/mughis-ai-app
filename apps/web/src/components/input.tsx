"use client";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  label?: string;
  rows?: number;
  multiline?: boolean;
};

export function Input({ value, onChange, placeholder, type = "text", className, label }: Props) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={cn("w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 transition-colors", className)} />
    </div>
  );
}

export function Textarea({ value, onChange, placeholder, className, label, rows = 3 }: Props) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className={cn("w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 resize-none transition-colors", className)} />
    </div>
  );
}
