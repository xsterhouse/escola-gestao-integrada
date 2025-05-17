
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetric } from "@/lib/types";

type DashboardCardsProps = {
  metrics: DashboardMetric[];
};

export function DashboardCards({ metrics }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metric.value}</div>
              
              {metric.change !== undefined && (
                <div 
                  className={`text-xs font-medium ${
                    metric.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.change > 0 && "+"}
                  {metric.change}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
