
import { Button } from "@/components/ui/button";
import { FilePlus, Upload } from "lucide-react";

interface InventoryHeaderProps {
  onAddInvoice: () => void;
  onImportXml: () => void;
}

export function InventoryHeader({ onAddInvoice, onImportXml }: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Módulo de Estoque</h1>
        <p className="text-muted-foreground">
          Gerencie o estoque de produtos através de notas fiscais eletrônicas
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={onAddInvoice} className="w-full sm:w-auto">
          <FilePlus className="mr-2 h-4 w-4" />
          Cadastro de Produtos
        </Button>
        <Button onClick={onImportXml} variant="outline" className="w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          Importar XML NF-e
        </Button>
      </div>
    </div>
  );
}
