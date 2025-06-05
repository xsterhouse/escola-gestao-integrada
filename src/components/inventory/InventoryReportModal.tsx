
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Package, AlertTriangle, Download } from "lucide-react";
import { Invoice, InventoryMovement } from "@/lib/types";
import { format } from "date-fns";
import { generateInventoryReportPDF } from "@/lib/inventory-pdf-utils";
import { getAllProductsStock, checkLowStock } from "@/lib/inventory-calculations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface InventoryReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: Invoice[];
  movements: InventoryMovement[];
}

export function InventoryReportModal({
  open,
  onOpenChange,
  invoices,
  movements
}: InventoryReportModalProps) {
  const { currentSchool, user } = useAuth();
  const [reportType, setReportType] = useState<'by-invoice' | 'current-stock' | 'low-stock'>('by-invoice');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const approvedInvoices = invoices.filter(invoice => invoice.status === 'aprovada' && invoice.isActive);
  const stockData = getAllProductsStock(invoices, movements);
  const lowStockItems = checkLowStock(stockData, lowStockThreshold);

  const handleInvoiceToggle = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAllInvoices = () => {
    if (selectedInvoices.length === approvedInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(approvedInvoices.map(inv => inv.id));
    }
  };

  const handleGenerateReport = () => {
    if (!currentSchool || !user) {
      toast({
        title: "Erro",
        description: "Informações do usuário não encontradas.",
        variant: "destructive"
      });
      return;
    }

    let reportData;
    let selectedMovements: InventoryMovement[] = [];

    switch (reportType) {
      case 'by-invoice':
        if (selectedInvoices.length === 0) {
          toast({
            title: "Seleção necessária",
            description: "Selecione ao menos uma nota fiscal.",
            variant: "destructive"
          });
          return;
        }
        
        selectedMovements = movements.filter(mov => 
          mov.source === 'invoice' && selectedInvoices.includes(mov.invoiceId || '')
        );
        
        reportData = {
          schoolName: currentSchool.name,
          userName: user.name,
          date: new Date().toLocaleDateString('pt-BR'),
          reportType: 'movements' as const,
          movements: selectedMovements,
          selectedInvoices: approvedInvoices.filter(inv => selectedInvoices.includes(inv.id))
        };
        break;

      case 'current-stock':
        reportData = {
          schoolName: currentSchool.name,
          userName: user.name,
          date: new Date().toLocaleDateString('pt-BR'),
          reportType: 'current-stock' as const,
          stockData
        };
        break;

      case 'low-stock':
        reportData = {
          schoolName: currentSchool.name,
          userName: user.name,
          date: new Date().toLocaleDateString('pt-BR'),
          reportType: 'current-stock' as const,
          stockData: lowStockItems,
          lowStockThreshold
        };
        break;
    }

    generateInventoryReportPDF(reportData);
    
    toast({
      title: "Relatório gerado",
      description: "O relatório PDF foi gerado com sucesso.",
    });

    onOpenChange(false);
  };

  const getItemCount = () => {
    switch (reportType) {
      case 'by-invoice':
        return selectedInvoices.reduce((total, invoiceId) => {
          const invoice = approvedInvoices.find(inv => inv.id === invoiceId);
          return total + (invoice?.items.length || 0);
        }, 0);
      case 'current-stock':
        return stockData.length;
      case 'low-stock':
        return lowStockItems.length;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Gerar Relatório de Estoque
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${reportType === 'by-invoice' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setReportType('by-invoice')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Por Nota Fiscal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Relatório detalhado de itens por nota fiscal selecionada
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${reportType === 'current-stock' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setReportType('current-stock')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-green-600" />
                  Estoque Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Relatório completo do estoque atual da escola
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${reportType === 'low-stock' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setReportType('low-stock')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Baixo Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Produtos que estão abaixo do limite de estoque
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Report Type Specific Content */}
          {reportType === 'by-invoice' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Selecionar Notas Fiscais</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAllInvoices}
                >
                  {selectedInvoices.length === approvedInvoices.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                </Button>
              </div>
              
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {approvedInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={() => handleInvoiceToggle(invoice.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">NF {invoice.danfeNumber}</span>
                        <span className="text-sm text-muted-foreground">
                          {invoice.items.length} itens
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.supplier.name} • {format(invoice.issueDate, 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportType === 'current-stock' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Relatório de Estoque Atual</h3>
              <p className="text-muted-foreground">
                Este relatório incluirá todos os {stockData.length} produtos atualmente em estoque,
                com informações detalhadas sobre quantidades, valores e fornecedores.
              </p>
            </div>
          )}

          {reportType === 'low-stock' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Relatório de Baixo Estoque</h3>
              
              <div className="mb-4">
                <Label htmlFor="threshold">Limite de Estoque Baixo</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-32 mt-1"
                  min="1"
                />
              </div>
              
              <p className="text-muted-foreground">
                Este relatório incluirá {lowStockItems.length} produtos que estão com estoque 
                abaixo de {lowStockThreshold} unidades.
              </p>
            </div>
          )}

          <Separator />

          {/* Summary and Generate Button */}
          <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
            <div>
              <p className="font-medium">Itens a serem incluídos: {getItemCount()}</p>
              <p className="text-sm text-muted-foreground">
                Escola: {currentSchool?.name} • Usuário: {user?.name}
              </p>
            </div>
            
            <Button 
              onClick={handleGenerateReport}
              disabled={reportType === 'by-invoice' && selectedInvoices.length === 0}
              className="min-w-32"
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
