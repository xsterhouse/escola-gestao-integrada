
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";

interface ProductReportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onConfirmExport: () => void;
  title: string;
}

export function ProductReportPreview({ 
  open, 
  onOpenChange, 
  products, 
  onConfirmExport, 
  title 
}: ProductReportPreviewProps) {
  const schoolName = "ESCOLA MUNICIPAL EXEMPLO"; // This would come from user context

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualizar Relatório - {title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Preview */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h1 className="text-xl font-bold text-gray-800">
                  SISTEMA DE GESTÃO ESCOLAR
                </h1>
                <h2 className="text-lg font-semibold text-gray-700">
                  {schoolName}
                </h2>
                <h3 className="text-base font-medium text-gray-600">
                  {title}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Products Table Preview */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-1 text-xs font-semibold">Item</th>
                      <th className="text-left py-2 px-1 text-xs font-semibold">Descrição</th>
                      <th className="text-left py-2 px-1 text-xs font-semibold">Unidade</th>
                      <th className="text-left py-2 px-1 text-xs font-semibold">Quantidade</th>
                      <th className="text-left py-2 px-1 text-xs font-semibold">Agricultura Familiar</th>
                      <th className="text-left py-2 px-1 text-xs font-semibold">Indicação</th>
                      <th className="text-left py-2 px-1 text-xs font-semibold">Restrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((product) => (
                      <tr key={product.id} className="border-b border-gray-200">
                        <td className="py-1 px-1 text-xs">{product.item}</td>
                        <td className="py-1 px-1 text-xs">{product.description}</td>
                        <td className="py-1 px-1 text-xs">{product.unit}</td>
                        <td className="py-1 px-1 text-xs">{product.quantity || "-"}</td>
                        <td className="py-1 px-1 text-xs">{product.familyAgriculture ? "Sim" : "Não"}</td>
                        <td className="py-1 px-1 text-xs">{product.indication || "-"}</td>
                        <td className="py-1 px-1 text-xs">{product.restriction || "-"}</td>
                      </tr>
                    ))}
                    {products.length > 10 && (
                      <tr>
                        <td colSpan={7} className="py-2 px-1 text-xs text-gray-500 text-center">
                          ... e mais {products.length - 10} produtos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Total de produtos: <strong>{products.length}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Agricultura familiar: <strong>{products.filter(p => p.familyAgriculture).length}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirmExport}>
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
