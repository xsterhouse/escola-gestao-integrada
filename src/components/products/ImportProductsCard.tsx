
import { useRef } from "react";
import { Import } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportProductsDropzone } from "./ImportProductsDropzone";
import { Product } from "@/lib/types";

interface ImportProductsCardProps {
  onProductsImported: (newProducts: Product[]) => void;
  existingProducts: Product[];
}

export function ImportProductsCard({ onProductsImported, existingProducts }: ImportProductsCardProps) {
  // Ref to the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Tabela de Produtos</CardTitle>
        <CardDescription>
          Importe produtos a partir de um arquivo .docx contendo uma tabela com os campos: ITEM, DESCRIÇÃO DO PRODUTO, UNID, QUANT.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ImportProductsDropzone 
          onProductsImported={onProductsImported}
          existingProducts={existingProducts}
        />
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Import className="mr-2 h-4 w-4" />
            Importar Produtos
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".docx"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                // Trigger the dropzone's file handler
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(e.target.files[0]);
                const event = new Event('drop', { bubbles: true });
                Object.defineProperty(event, 'dataTransfer', {
                  value: dataTransfer,
                });
                const dropzoneElement = document.querySelector('[role="presentation"]');
                dropzoneElement?.dispatchEvent(event);
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
