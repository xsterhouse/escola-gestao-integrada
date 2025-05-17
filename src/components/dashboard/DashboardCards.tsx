
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetric } from "@/lib/types";
import { FileText, Package, Receipt, DollarSign } from "lucide-react";

type DashboardCardsProps = {
  metrics: DashboardMetric[];
};

const getIconComponent = (icon: string) => {
  switch (icon) {
    case "contracts":
      return <FileText className="h-5 w-5 text-blue-600" />;
    case "stock":
      return <Package className="h-5 w-5 text-amber-600" />;
    case "receipt":
      return <Receipt className="h-5 w-5 text-orange-600" />;
    case "finance":
      return <DollarSign className="h-5 w-5 text-green-600" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

const getBackgroundColor = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-100";
    case "amber":
      return "bg-amber-100";
    case "orange":
      return "bg-orange-100";
    case "green":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
};

const getBorderColor = (color: string) => {
  switch (color) {
    case "blue":
      return "border-t-blue-600";
    case "amber":
      return "border-t-amber-600";
    case "orange":
      return "border-t-orange-600";
    case "green":
      return "border-t-green-600";
    default:
      return "border-t-gray-600";
  }
};

const getTextColor = (color: string) => {
  switch (color) {
    case "blue":
      return "text-blue-600";
    case "amber":
      return "text-amber-600";
    case "orange":
      return "text-orange-600";
    case "green":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

export function DashboardCards({ metrics }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card 
          key={metric.id} 
          className={`border-t-4 ${getBorderColor(metric.color)}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metric.value}</div>
              <div className={`${getBackgroundColor(metric.color)} p-2 rounded-lg`}>
                {getIconComponent(metric.icon)}
              </div>
            </div>
            {metric.additionalInfo && (
              <div className={`text-xs ${getTextColor(metric.color)} mt-2`}>
                <span className="flex items-center">
                  {metric.additionalInfo}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
