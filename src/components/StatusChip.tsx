import { Check, Circle } from "lucide-react";

interface StatusChipProps {
  label: string;
  active: boolean;
}

const StatusChip = ({ label, active }: StatusChipProps) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
      active
        ? "bg-success/15 text-success border border-success/30"
        : "bg-muted text-muted-foreground border border-border"
    }`}
  >
    {active ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3 h-3" />}
    {label}
  </div>
);

export default StatusChip;
