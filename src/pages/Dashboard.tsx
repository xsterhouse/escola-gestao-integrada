import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportXmlModal } from "@/components/dashboard/ImportXmlModal";
import { DanfeConsultModule } from "@/components/dashboard/DanfeConsultModule";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FileText, 
  Package, 
  DollarSign,
  Import
} from "lucide-react";

const Dashboard = () => {
  const { user, currentSchool } = useAuth();
  const navigate = useNavigate();
  const [lastAccess, setLastAccess] = useState("");
  const [activeContracts, setActiveContracts] = useState(0);
  const [stockProducts, setStockProducts] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
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
    
    // Load real data from system
    loadSystemData();
  }, [user]);

  const loadSystemData = () => {
    // In a real implementation, these would be API calls to fetch actual data
    // For now, we'll get data from localStorage or start with 0
    
    // Get contracts data from localStorage
    const contractsData = localStorage.getItem('contracts');
    if (contractsData) {
      const contracts = JSON.parse(contractsData);
      const activeContractsCount = contracts.filter((contract: any) => contract.status === 'ativo').length;
      setActiveContracts(activeContractsCount);
    }
    
    // Get products data from localStorage
    const productsData = localStorage.getItem('products');
    if (productsData) {
      const products = JSON.parse(productsData);
      setStockProducts(products.length);
    }
  };

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
          <Card 
            className="bg-white shadow-sm border-l-4 border-l-[#012340] hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={() => navigate('/contracts')}
          >
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
          
          <Card 
            className="bg-white shadow-sm border-l-4 border-l-[#012340] hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={() => navigate('/products')}
          >
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
          
          <Card 
            className="bg-white shadow-sm border-l-4 border-l-[#012340] hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={() => setIsImportModalOpen(true)}
          >
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
          
          <Card 
            className="bg-white shadow-sm border-l-4 border-l-[#012340] hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={() => navigate('/financial')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#012340]/10 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-[#012340]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Financeiro</p>
                  <p className="text-sm text-muted-foreground">Gestão financeira</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-t-4 border-t-[#012340] md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Contratos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{activeContracts}</div>
                <div className="bg-[#012340]/10 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-[#012340]" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                <span className="flex items-center">
                  Contratos cadastrados no sistema
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
                <div className="text-3xl font-bold">{stockProducts}</div>
                <div className="bg-[#012340]/10 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-[#012340]" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                <span className="flex items-center">
                  Produtos cadastrados no sistema
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Módulo DANFE */}
        <DanfeConsultModule />
      </div>

      <ImportXmlModal 
        open={isImportModalOpen} 
        onOpenChange={setIsImportModalOpen} 
      />
    </AppLayout>
  );
};

export default Dashboard;
