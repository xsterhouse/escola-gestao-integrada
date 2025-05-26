
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Package, Users, Building2, TrendingUp, AlertTriangle } from "lucide-react";

export function DashboardCards() {
  // Dados mockados para o dashboard como estava originalmente
  const data = {
    totalContracts: 145,
    activeContracts: 127,
    totalProducts: 2340,
    lowStockProducts: 23,
    totalUsers: 89,
    totalSchools: 12,
    pendingPayments: 34,
    monthlyRevenue: 125670.50
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeContracts}</div>
          <p className="text-xs text-muted-foreground">
            de {data.totalContracts} contratos totais
          </p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produtos em Estoque</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {data.lowStockProducts > 0 && (
              <span className="text-amber-600 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {data.lowStockProducts} com estoque baixo
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pendingPayments}</div>
          <p className="text-xs text-muted-foreground">
            contas a pagar
          </p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            no mês atual
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
