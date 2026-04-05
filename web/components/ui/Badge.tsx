import { cn } from "@/lib/utils"

type Variant = "success" | "danger" | "warn" | "default"

const variantClasses: Record<Variant, string> = {
  success: "bg-[rgba(52,211,153,0.12)] text-[var(--success)]",
  danger:  "bg-[rgba(251,113,133,0.12)] text-[var(--danger)]",
  warn:    "bg-[rgba(167,139,250,0.12)] text-[var(--warn)]",
  default: "bg-[var(--card)] text-[var(--text-2)]",
}

export function Badge({ children, variant = "default" }: {
  children: React.ReactNode
  variant?: Variant
}) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium", variantClasses[variant])}>
      {children}
    </span>
  )
}
