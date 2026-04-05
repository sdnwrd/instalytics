import { cn } from "@/lib/utils"

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
