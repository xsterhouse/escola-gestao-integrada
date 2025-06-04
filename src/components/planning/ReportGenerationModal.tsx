
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileSpreadsheet, Building2, User, Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { generateATAReportPDF } from "@/lib/ata-report-pdf";

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: any[];
}

export function ReportGenerationModal({ isOpen, onClose, contracts }: ReportGenerationModalProps) {
  const { currentSchool, user } = useAuth();
  const [reportType, setReportType] = useState<"school" | "products">("school");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (!currentSchool || !user) return;

    setIsGenerating(true);
    
    try {
      const reportData = {
        schoolName: currentSchool.name,
        purchasingCenterName: "Central de Compras Municipal", // Pode vir de um contexto
        userName: user.name,
        date: new Date().toLocaleDateString('pt-BR'),
        reportType,
        contracts: contracts.filter(contract => 
          selectedSchool === "all" || contract.schoolId === selectedSchool
        )
      };

      await generateATAReportPDF(reportData);
      onClose();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExcel = () => {
    // Implementar geração de Excel (CSV)
    const headers = reportType === "school" 
      ? ["Escola", "ATA", "Fornecedor", "Data", "Valor Total", "Status"]
      : ["Produto", "Quantidade", "Unidade", "Valor Unitário", "Valor Total", "Fornecedor"];

    const csvData = contracts
      .filter(contract => selectedSchool === "all" || contract.schoolId === selectedSchool)
      .map(contract => {
        if (reportType === "school") {
          return [
            currentSchool?.name || "",
            contract.numeroATA || "",
            contract.fornecedor || "",
            new Date(contract.dataATA).toLocaleDateString('pt-BR'),
            `R$ ${contract.items.reduce((total: number, item: any) => total + item.valorTotal, 0).toFixed(2)}`,
            "Ativo"
          ];
        } else {
          return contract.items.flatMap((item: any) => [
            item.descricaoProduto,
            item.quantidade.toString(),
            item.unidade,
            `R$ ${item.valorUnitario.toFixed(2)}`,
            `R$ ${item.valorTotal.toFixed(2)}`,
            contract.fornecedor
          ]);
        }
      });

    const csvContent = [headers, ...csvData]
      .map(row => Array.isArray(row[0]) ? row.flat() : row)
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-atas-${reportType}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Gerar Relatório de ATAs</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Sessão */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Informações do Relatório
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Escola</p>
                  <p className="font-medium">{currentSchool?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Central de Compras</p>
                  <p className="font-medium">Central de Compras Municipal</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Usuário</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Data de Geração</p>
                  <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opções do Relatório */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={(value: "school" | "products") => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">Por Escola</SelectItem>
                  <SelectItem value="products">Por Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filtrar por Escola</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Escolas</SelectItem>
                  <SelectItem value={currentSchool?.id || ""}>{currentSchool?.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumo */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{contracts.length}</p>
                  <p className="text-sm text-gray-600">Total de ATAs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {contracts.reduce((total, contract) => total + contract.items.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total de Itens</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {contracts.reduce((total, contract) => 
                      total + contract.items.reduce((itemTotal: number, item: any) => itemTotal + item.valorTotal, 0), 0
                    ).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Valor Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleGenerateExcel}
              disabled={isGenerating}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            
            <Button 
              className="flex-1" 
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              style={{ backgroundColor: "#012340" }}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGenerating ? "Gerando..." : "Gerar PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
