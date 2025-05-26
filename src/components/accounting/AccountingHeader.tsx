
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AccountingHeader() {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Get accounting entries and accounts from localStorage
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const accounts = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');
    
    // Create CSV content for entries
    const entriesHeader = "Data,Histórico,Débito,Crédito,Valor Total,Data Criação\n";
    const entriesContent = entries.map((entry: any) => 
      `${entry.date},${entry.history},"${entry.debitDescription}","${entry.creditDescription}",${entry.totalValue},${entry.createdAt}`
    ).join("\n");
    
    // Create CSV content for accounts
    const accountsHeader = "\n\nContas Configuradas:\nCódigo,Descrição,Tipo\n";
    const accountsContent = accounts.map((account: any) =>
      `${account.code},"${account.description}",${account.type}`
    ).join("\n");
    
    const fullContent = entriesHeader + entriesContent + accountsHeader + accountsContent;
    
    // Create and download file
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dados_contabeis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: "Os dados contábeis foram exportados com sucesso.",
    });
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Exportar
      </Button>
    </div>
  );
}
