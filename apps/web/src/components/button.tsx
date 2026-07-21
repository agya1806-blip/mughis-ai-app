"use client";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
};

export function Button({ children, onClick, variant = "primary", size = "md", className, disabled, loading, type = "button" }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20",
    secondary: "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700",
    ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };
  const sizes = { sm: "h-9 px-3 text-xs", md: "h-11 px-4 text-sm", lg: "h-12 px-6 text-base" };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cn(base, variants[variant], sizes[size], className)}>
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}
