
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardMetric, School } from "@/lib/types";
import { 
  FileText, 
  Package, 
  Receipt, 
  DollarSign,
  BarChart3,
  PieChart,
  Import
} from "lucide-react";

const Dashboard = () => {
  const { user, currentSchool } = useAuth();
  const [lastAccess, setLastAccess] = useState("");
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  
  useEffect(() => {
    // Get the last access from localStorage or set current time
    const storedLastAccess = localStorage.getItem('lastAccess');
    const currentTime = new Date();
    
    if (storedLastAccess) {
      // Format the stored last access time
      const lastAccessDate = new Date(storedLastAccess);
      const formattedLastAccess = lastAccessDate.toLocaleDateString('pt-BR', {
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      setLastAccess(formattedLastAccess);
    } else {
      // If no previous access, show "Primeiro acesso"
      setLastAccess("Primeiro acesso ao sistema");
    }
    
    // Store current time as the new last access for next visit
    localStorage.setItem('lastAccess', currentTime.toISOString());
    
    // In a real app, these would come from an API call
    setMetrics([
      {
        id: "1",
        title: "Contratos Ativos",
        value: "32",
        icon: "contracts",
        color: "blue",
        additionalInfo: "5 novos este mês"
      },
      {
        id: "2",
        title: "Produtos em Estoque",
        value: "1.250",
        icon: "stock",
        color: "amber",
        additionalInfo: "8% desde o último mês"
      },
      {
        id: "3",
        title: "Notas e Recibos",
        value: "145",
        icon: "receipt",
        color: "orange",
        additionalInfo: "65 processados"
      },
      {
        id: "4",
        title: "Financeiro",
        value: "R$ 24.500",
        icon: "finance",
        color: "green",
        additionalInfo: "12 pagamentos pendentes"
      },
    ]);
  }, [user]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              Bem-vindo ao SIGRE
            </h1>
            <p className="text-muted-foreground">
              Sistema Integrado de Gestão de Recursos Escolares
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            <div className="text-sm text-muted-foreground">
              Último acesso: {lastAccess}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm border-l-4 border-l-[#012340]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#012340]/10 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-[#012340]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Novo Contrato</p>
                  <p className="text-sm text-muted-foreground">Cadastrar novo contrato</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-l-4 border-l-[#012340]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#012340]/10 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-[#012340]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registrar Produto</p>
                  <p className="text-sm text-muted-foreground">Adicionar novo produto</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-l-4 border-l-[#012340]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#012340]/10 p-3 rounded-lg">
                  <Import className="h-6 w-6 text-[#012340]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Importar Nota</p>
                  <p className="text-sm text-muted-foreground">Importar Nota XML</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-l-4 border-l-[#012340]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#012340]/10 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-[#012340]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Novo Pagamento</p>
                  <p className="text-sm text-muted-foreground">Registrar pagamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-t-4 border-t-[#012340] md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Contratos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">32</div>
                <div className="bg-[#012340]/10 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-[#012340]" />
                </div>
              </div>
              <div className="text-xs text-green-600 mt-2">
                <span className="flex items-center">
                  5 novos este mês
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-[#012340] md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Produtos em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">1.250</div>
                <div className="bg-[#012340]/10 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-[#012340]" />
                </div>
              </div>
              <div className="text-xs text-amber-600 mt-2">
                <span className="flex items-center">
                  8% desde o último mês
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-[#012340] md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Notas e Recibos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">145</div>
                <div className="bg-[#012340]/10 p-2 rounded-lg">
                  <Receipt className="h-5 w-5 text-[#012340]" />
                </div>
              </div>
              <div className="text-xs text-orange-600 mt-2">
                <span className="flex items-center">
                  65 processados
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-[#012340] md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">R$ 24.500</div>
                <div className="bg-[#012340]/10 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-[#012340]" />
                </div>
              </div>
              <div className="text-xs text-green-600 mt-2">
                <span className="flex items-center">
                  12 pagamentos pendentes
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="col-span-1">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Análise Financeira</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-center items-center h-60">
                <BarChart3 className="h-40 w-40 text-[#012340]/50" />
                <p className="text-sm text-muted-foreground absolute">
                  Gráficos serão exibidos aqui
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Visão Geral do Estoque - Alimentos</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-center items-center h-60">
                <PieChart className="h-40 w-40 text-[#012340]/50" />
                <p className="text-sm text-muted-foreground absolute">
                  Gráficos serão exibidos aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
