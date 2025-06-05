
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface PartialPaymentBadgeProps {
  className?: string;
}

export function PartialPaymentBadge({ className = "" }: PartialPaymentBadgeProps) {
  return (
    <Badge variant="outline" className={`bg-orange-100 text-orange-800 border-orange-300 ${className}`}>
      <Clock className="h-3 w-3 mr-1" />
      Parcial
    </Badge>
  );
}
