
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Package, Users, Building2, TrendingUp, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardData {
  totalContracts: number;
  activeContracts: number;
  totalProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  totalSchools: number;
  pendingPayments: number;
  monthlyRevenue: number;
}

export function DashboardCards() {
  const [data, setData] = useState<DashboardData>({
    totalContracts: 0,
    activeContracts: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalUsers: 0,
    totalSchools: 0,
    pendingPayments: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Simular dados para demonstração
    setData({
      totalContracts: 24,
      activeContracts: 18,
      totalProducts: 156,
      lowStockProducts: 12,
      totalUsers: 8,
      totalSchools: 3,
      pendingPayments: 7,
      monthlyRevenue: 45250.80
    });
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
            {data.lowStockProducts === 0 && "Todos com estoque adequado"}
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
