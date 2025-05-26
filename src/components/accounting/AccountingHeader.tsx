
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";

export function AccountingHeader() {
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Implementar exportação
    console.log("Exportando dados contábeis...");
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
