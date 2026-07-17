import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/leads";
import { getStatusLabel, leadStatusVariants } from "@/lib/leads-format";

type LeadStatusBadgeProps = {
  status: LeadStatus;
  className?: string;
};

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <Badge variant={leadStatusVariants[status]} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
}
