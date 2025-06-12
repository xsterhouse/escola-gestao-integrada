
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package, DollarSign, Users, FileText } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="ml-1">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total de Produtos"
        value="1,234"
        change="+20.1% em relação ao mês anterior"
        trend="up"
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Receita Total"
        value="R$ 45.231"
        change="+15.3% em relação ao mês anterior"
        trend="up"
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Contratos Ativos"
        value="89"
        change="+5.2% em relação ao mês anterior"
        trend="up"
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Usuários Ativos"
        value="573"
        change="-2.1% em relação ao mês anterior"
        trend="down"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
