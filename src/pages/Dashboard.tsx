
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardMetric } from "@/lib/types";

const Dashboard = () => {
  const { user, currentSchool } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  
  useEffect(() => {
    // In a real app, these would come from an API call
    // For demo purposes, we're using mock data
    setMetrics([
      {
        id: "1",
        title: "Contratos Ativos",
        value: 12,
        change: 2.5,
        icon: "contracts",
        color: "blue",
      },
      {
        id: "2",
        title: "Valor em Estoque",
        value: "R$ 125.430,00",
        change: -1.2,
        icon: "stock",
        color: "green",
      },
      {
        id: "3",
        title: "A Pagar (30 dias)",
        value: "R$ 48.290,00",
        change: 0,
        icon: "finance",
        color: "orange",
      },
      {
        id: "4",
        title: "A Receber (30 dias)",
        value: "R$ 35.800,00",
        change: 3.8,
        icon: "finance",
        color: "purple",
      },
    ]);
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, {user?.name}
          </h1>
          {currentSchool && (
            <p className="text-muted-foreground">
              {currentSchool.name}
            </p>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Análise</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <DashboardCards metrics={metrics} />
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Contratos Recentes</CardTitle>
                  <CardDescription>
                    Últimos contratos cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Contrato #2023-42</div>
                      <div className="text-sm text-muted-foreground">Material Escolar</div>
                    </div>
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Contrato #2023-41</div>
                      <div className="text-sm text-muted-foreground">Merenda Escolar</div>
                    </div>
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Contrato #2023-40</div>
                      <div className="text-sm text-muted-foreground">Manutenção Predial</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Estoque Crítico</CardTitle>
                  <CardDescription>
                    Itens com estoque abaixo do mínimo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Cadernos</div>
                      <div className="text-sm text-muted-foreground">Estoque: 15 | Mínimo: 50</div>
                    </div>
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Papel A4</div>
                      <div className="text-sm text-muted-foreground">Estoque: 8 | Mínimo: 20</div>
                    </div>
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Toner Impressora</div>
                      <div className="text-sm text-muted-foreground">Estoque: 2 | Mínimo: 5</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Vencimentos</CardTitle>
                  <CardDescription>
                    Contas a pagar nos próximos 7 dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Fornecedor ABC</div>
                      <div className="text-sm text-muted-foreground">R$ 5.280,00 - Vence em 2 dias</div>
                    </div>
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Serviço de Internet</div>
                      <div className="text-sm text-muted-foreground">R$ 890,00 - Vence em 3 dias</div>
                    </div>
                    <div className="border-b pb-2">
                      <div className="text-sm font-medium">Manutenção Ar Condicionado</div>
                      <div className="text-sm text-muted-foreground">R$ 1.200,00 - Vence em 5 dias</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="h-96">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Dados</CardTitle>
                <CardDescription>
                  Visualize tendências e indicadores importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Gráficos e análises detalhadas serão exibidos aqui.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="h-96">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>
                  Gere e visualize relatórios personalizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Relatórios personalizados serão exibidos aqui.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
