import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, type AppointmentStatus } from "@/types";

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
