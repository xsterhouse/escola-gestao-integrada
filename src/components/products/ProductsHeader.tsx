
import { Button } from "@/components/ui/button";
import { Import, Download, FileText } from "lucide-react";

interface ProductsHeaderProps {
  onImport: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
}

export function ProductsHeader({
  onImport,
  onExportCurrent,
  onExportAll
}: ProductsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Produtos</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onImport}
        >
          <Import className="mr-2 h-4 w-4" />
          Importar Produtos
        </Button>
        <Button
          variant="outline"
          onClick={onExportCurrent}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
        <Button
          variant="outline"
          onClick={onExportAll}
        >
          <FileText className="mr-2 h-4 w-4" />
          Exportar Todos
        </Button>
      </div>
    </div>
  );
}
