
import { Card, CardContent } from "@/components/ui/card";
import { StockCalculation } from "@/lib/inventory-calculations";

interface StockInfoDisplayProps {
  currentStock: StockCalculation | null;
}

export function StockInfoDisplay({ currentStock }: StockInfoDisplayProps) {
  if (!currentStock) return null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-900">Estoque Atual</p>
            <p className="text-blue-700">{currentStock.currentStock} {currentStock.unitOfMeasure}</p>
          </div>
          <div>
            <p className="font-medium text-blue-900">Custo Médio</p>
            <p className="text-blue-700">R$ {currentStock.averageUnitCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-medium text-blue-900">Valor Total</p>
            <p className="text-blue-700">R$ {currentStock.totalValue.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
