import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, Minus, ArrowDown, ArrowUp, Search, FileText, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { InventoryMovement, Invoice } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { SimpleExitMovementDialog } from "./SimpleExitMovementDialog";
import { ViewMovementDialog } from "./ViewMovementDialog";
import { CurrentStockTable } from "./CurrentStockTable";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { getAllProductsStock, checkLowStock } from "@/lib/inventory-calculations";
import { generateMovementsFromInvoices } from "@/lib/invoice-movements";

interface InventoryMovementsProps {
  invoices: Invoice[];
}

export function InventoryMovements({ invoices }: InventoryMovementsProps) {
  const { currentSchool } = useAuth();
  
  const movementsKey = currentSchool ? `inventory-movements_${currentSchool.id}` : 'inventory-movements';
  const { data: manualMovements, saveData: setManualMovements } = useLocalStorageSync<InventoryMovement>(movementsKey, []);
  
  const [isExitMovementOpen, setIsExitMovementOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);

  console.log(`📦 Carregando movimentações com chave: ${movementsKey} - ${manualMovements.length} movimentações manuais`);

  // Generate movements from invoices and combine with manual movements
  const invoiceMovements = generateMovementsFromInvoices(invoices);
  const allMovements = [...invoiceMovements, ...manualMovements];
  
  console.log(`📋 Total de movimentações: ${allMovements.length} (${invoiceMovements.length} de notas fiscais + ${manualMovements.length} manuais)`);

  // Check for low stock alerts whenever movements or invoices change
  useEffect(() => {
    const calculatedStockData = getAllProductsStock(invoices, manualMovements);
    setStockData(calculatedStockData);
    
    const lowStockItems = checkLowStock(calculatedStockData, 10);
    
    if (lowStockItems.length > 0) {
      console.log("⚠️ Itens com estoque baixo detectados:", lowStockItems.length);
      setLowStockAlerts(lowStockItems);
      
      // Show toast notification for low stock
      lowStockItems.forEach(item => {
        if (item.currentStock <= 5) {
          toast({
            title: "⚠️ Estoque Crítico",
            description: `${item.productDescription}: apenas ${item.currentStock} ${item.unitOfMeasure} restantes`,
            variant: "destructive"
          });
        }
      });
    } else {
      setLowStockAlerts([]);
    }
  }, [manualMovements, invoices]);

  const handleExitMovement = (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => {
    console.log("📤 Processando saída de estoque:", movement);
    
    // Validate stock before processing exit
    const productStock = stockData.find(stock => 
      stock.productDescription === movement.productDescription && 
      stock.unitOfMeasure === movement.unitOfMeasure
    );

    if (!productStock || productStock.currentStock < movement.quantity) {
      toast({
        title: "Estoque insuficiente",
        description: `Estoque disponível: ${productStock?.currentStock || 0} ${movement.unitOfMeasure}`,
        variant: "destructive"
      });
      return;
    }

    const newMovement: InventoryMovement = {
      ...movement,
      id: uuidv4(),
      type: 'saida',
      date: movement.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unitPrice: movement.unitPrice || productStock.averageUnitCost,
      totalCost: movement.totalCost || (movement.quantity * (movement.unitPrice || productStock.averageUnitCost))
    };

    const updatedMovements = [...manualMovements, newMovement];
    setManualMovements(updatedMovements);
    
    console.log("✅ Saída de estoque processada com sucesso:", newMovement.id);
    
    // Check if this creates a low stock situation
    const remainingStock = productStock.currentStock - movement.quantity;
    if (remainingStock <= 10) {
      toast({
        title: remainingStock <= 5 ? "⚠️ Estoque Crítico" : "📦 Estoque Baixo",
        description: `${movement.productDescription}: ${remainingStock} ${movement.unitOfMeasure} restantes`,
        variant: remainingStock <= 5 ? "destructive" : "default"
      });
    }
    
    toast({
      title: "Saída registrada",
      description: `${movement.productDescription} - ${movement.quantity} ${movement.unitOfMeasure}`,
    });
  };

  const filteredMovements = allMovements.filter(movement => {
    const matchesSearch = movement.productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (typeFilter === "entrada") {
      matchesType = movement.type === "entrada";
    } else if (typeFilter === "saida") {
      matchesType = movement.type === "saida";
    }
    // Para "all", matchesType permanece true
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMovementIcon = (movement: InventoryMovement) => {
    if (movement.source === 'invoice') {
      return <FileText className="h-4 w-4" />;
    } else if (movement.type === 'entrada') {
      return <ArrowDown className="h-4 w-4" />;
    } else {
      return <ArrowUp className="h-4 w-4" />;
    }
  };

  const getMovementDescription = (movement: InventoryMovement) => {
    if (movement.source === 'invoice') {
      return `Nota Fiscal • ${movement.reason}`;
    }
    return movement.reason;
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque Baixo ({lowStockAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2">
              {lowStockAlerts.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium text-orange-900">{item.productDescription}</span>
                    <span className="text-sm text-orange-700 ml-2">({item.unitOfMeasure})</span>
                  </div>
                  <Badge variant={item.currentStock <= 5 ? "destructive" : "secondary"}>
                    {item.currentStock} restantes
                  </Badge>
                </div>
              ))}
              {lowStockAlerts.length > 5 && (
                <p className="text-sm text-orange-600 text-center pt-2">
                  +{lowStockAlerts.length - 5} outros itens com estoque baixo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Stock Table */}
      <CurrentStockTable stockData={stockData} />

      {/* Actions Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por produto ou motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="entrada">Apenas entradas</SelectItem>
              <SelectItem value="saida">Apenas saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsExitMovementOpen(true)}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <Minus className="h-4 w-4 mr-2" />
            Saída de Item
          </Button>
        </div>
      </div>

      {/* Movements List with ScrollArea */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Movimentações de Estoque ({filteredMovements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma movimentação encontrada.</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] w-full rounded-md border">
              <div className="space-y-2 p-4">
                {filteredMovements
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedMovement(movement)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          movement.type === 'entrada' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {getMovementIcon(movement)}
                        </div>
                        
                        <div>
                          <h4 className="font-medium">{movement.productDescription}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(movement.date)} • {getMovementDescription(movement)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {movement.type === 'entrada' ? '+' : '-'}{movement.quantity} {movement.unitOfMeasure}
                          </span>
                          <Badge variant={movement.type === 'entrada' ? 'default' : 'secondary'}>
                            {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                          </Badge>
                          {movement.source === 'invoice' && (
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              NF
                            </Badge>
                          )}
                        </div>
                        {movement.totalCost && (
                          <p className="text-sm text-gray-600">
                            {formatCurrency(movement.totalCost)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SimpleExitMovementDialog 
        open={isExitMovementOpen}
        onOpenChange={setIsExitMovementOpen}
        onSubmit={handleExitMovement}
        invoices={invoices}
        movements={manualMovements}
      />

      {selectedMovement && (
        <ViewMovementDialog
          movement={selectedMovement}
          open={!!selectedMovement}
          onOpenChange={() => setSelectedMovement(null)}
        />
      )}
    </div>
  );
}
