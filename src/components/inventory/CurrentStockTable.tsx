
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";
import { StockCalculation } from "@/lib/inventory-calculations";

interface CurrentStockTableProps {
  stockData: StockCalculation[];
}

export function CurrentStockTable({ stockData }: CurrentStockTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return { variant: "destructive" as const, label: "Crítico", icon: AlertTriangle };
    if (stock <= 10) return { variant: "secondary" as const, label: "Baixo", icon: AlertTriangle };
    return { variant: "default" as const, label: "Normal", icon: Package };
  };

  const stockWithItems = stockData.filter(stock => stock.currentStock > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Estoque Atual ({stockWithItems.length} produtos)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stockWithItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum produto em estoque.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Produto</th>
                  <th className="text-left py-2 px-3">Unidade</th>
                  <th className="text-right py-2 px-3">Estoque</th>
                  <th className="text-right py-2 px-3">Custo Médio</th>
                  <th className="text-right py-2 px-3">Valor Total</th>
                  <th className="text-center py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockWithItems
                  .sort((a, b) => a.currentStock - b.currentStock)
                  .map((stock, index) => {
                    const status = getStockStatus(stock.currentStock);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="font-medium">{stock.productDescription}</div>
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {stock.unitOfMeasure}
                        </td>
                        <td className="py-3 px-3 text-right font-medium">
                          {stock.currentStock}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {formatCurrency(stock.averageUnitCost)}
                        </td>
                        <td className="py-3 px-3 text-right font-medium">
                          {formatCurrency(stock.totalValue)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={status.variant} className="flex items-center gap-1 w-fit mx-auto">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
