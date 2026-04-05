import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "danger"

const variantClasses: Record<Variant, string> = {
  primary:   "bg-[var(--accent)] text-white hover:opacity-90",
  secondary: "bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--card-hover)]",
  ghost:     "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--card)]",
  danger:    "bg-[rgba(251,113,133,0.12)] text-[var(--danger)] hover:bg-[rgba(251,113,133,0.2)]",
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
