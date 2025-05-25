
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileDown, FileText, X } from "lucide-react";
import { BankAccount } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateFinancialReportPDF, exportToCsv } from "@/lib/pdf-utils";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
}

export function GenerateReportModal({ 
  isOpen, 
  onClose, 
  bankAccounts
}: GenerateReportModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [bankAccountId, setBankAccountId] = useState<string>("all");
  const [accountType, setAccountType] = useState<string>("all");
  const [reconciliationStatus, setReconciliationStatus] = useState<string>("all");
  
  const handleGeneratePDF = () => {
    // In a real application, you would fetch data based on filters and generate the PDF
    toast.success("Gerando relatório em PDF...");
    
    const reportData = {
      title: "Relatório de Conciliação Bancária",
      period: startDate && endDate ? `${format(startDate, 'dd/MM/yyyy')} até ${format(endDate, 'dd/MM/yyyy')}` : "Todos",
      bankAccount: bankAccountId === "all" ? "Todas" : bankAccounts.find(acc => acc.id === bankAccountId)?.bankName || "",
      accountType: accountType === "all" ? "Todos" : accountType === "movimento" ? "Movimento" : "Aplicação",
      status: reconciliationStatus === "all" ? "Todos" : 
              reconciliationStatus === "conciliado" ? "Conciliado" : "Não Conciliado",
      // This would be filled with actual data based on filters in a real app
      data: []
    };
    
    generateFinancialReportPDF(reportData);
    onClose();
  };
  
  const handleExportExcel = () => {
    // In a real application, you would fetch data based on filters and export to CSV (Excel)
    toast.success("Exportando para Excel...");
    
    // Sample data, this would come from your filtered data
    const exportData = [
      {data: '01/05/2023', banco: 'Banco do Brasil', tipo: 'Movimento', descricao: 'Transferência', valor: 'R$ 1.500,00', tipo_lancamento: 'Crédito', situacao: 'Conciliado'},
      {data: '02/05/2023', banco: 'Banco do Brasil', tipo: 'Movimento', descricao: 'Pagamento Fornecedor', valor: 'R$ 500,00', tipo_lancamento: 'Débito', situacao: 'Conciliado'},
    ];
    
    exportToCsv(exportData, 'conciliacao_bancaria', [
      { header: 'Data', key: 'data' },
      { header: 'Banco', key: 'banco' },
      { header: 'Tipo de Conta', key: 'tipo' },
      { header: 'Descrição', key: 'descricao' },
      { header: 'Valor', key: 'valor' },
      { header: 'Tipo', key: 'tipo_lancamento' },
      { header: 'Situação', key: 'situacao' }
    ]);
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Gerar Relatório de Conciliação</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Banco</Label>
            <Select value={bankAccountId} onValueChange={setBankAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um banco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os bancos</SelectItem>
                {bankAccounts.filter(account => account.id && account.id.trim() !== '').map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.bankName} - {account.accountNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="movimento">Movimento</SelectItem>
                  <SelectItem value="aplicacao">Aplicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={reconciliationStatus} onValueChange={setReconciliationStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="conciliado">Conciliado</SelectItem>
                  <SelectItem value="nao_conciliado">Não Conciliado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button onClick={handleGeneratePDF}>
            <FileText className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
