import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

const GlassCard = ({ children, className }: GlassCardProps) => (
  <div className={cn("glass rounded-2xl p-5 shadow-card", className)}>
    {children}
  </div>
);

export default GlassCard;
