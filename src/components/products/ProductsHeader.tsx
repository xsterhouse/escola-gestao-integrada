
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileDown, Eye } from "lucide-react";
import { ProductReportPreview } from "./ProductReportPreview";

interface ProductsHeaderProps {
  onImport: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
  currentProducts?: any[];
  allProducts?: any[];
}

export function ProductsHeader({ 
  onImport, 
  onExportCurrent, 
  onExportAll,
  currentProducts = [],
  allProducts = []
}: ProductsHeaderProps) {
  const [previewType, setPreviewType] = useState<'current' | 'all' | null>(null);

  const handlePreviewCurrent = () => {
    setPreviewType('current');
  };

  const handlePreviewAll = () => {
    setPreviewType('all');
  };

  const handleConfirmExport = () => {
    if (previewType === 'current') {
      onExportCurrent();
    } else if (previewType === 'all') {
      onExportAll();
    }
    setPreviewType(null);
  };

  const getPreviewProducts = () => {
    return previewType === 'current' ? currentProducts : allProducts;
  };

  const getPreviewTitle = () => {
    return previewType === 'current' 
      ? "Relatório de Produtos Filtrados" 
      : "Relatório de Todos os Produtos";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gerenciamento de Produtos</span>
            <div className="flex items-center gap-2">
              <Button onClick={onImport} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviewCurrent}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Visualizar Relatório Atual
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviewAll}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Visualizar Todos os Produtos
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductReportPreview
        open={previewType !== null}
        onOpenChange={() => setPreviewType(null)}
        products={getPreviewProducts()}
        onConfirmExport={handleConfirmExport}
        title={getPreviewTitle()}
      />
    </>
  );
}
