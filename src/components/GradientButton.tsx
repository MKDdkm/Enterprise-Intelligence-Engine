import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
}

const GradientButton = ({ children, variant = "primary", size = "md", className, ...props }: GradientButtonProps) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={cn(
        "rounded-xl font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2",
        variant === "primary"
          ? "gradient-primary text-primary-foreground hover:opacity-90 shadow-elevated"
          : "border-2 border-primary text-primary hover:bg-primary/5",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;
