
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, TrendingDown, TrendingUp, Eye, Search } from "lucide-react";
import { Invoice, InventoryMovement } from "@/lib/types";
import { SimpleExitMovementDialog } from "./SimpleExitMovementDialog";
import { AddManualMovementDialog } from "./AddManualMovementDialog";
import { ViewMovementDialog } from "./ViewMovementDialog";
import { format } from "date-fns";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { useAuth } from "@/contexts/AuthContext";
import { useSyncManager } from "@/hooks/useSyncManager";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";

interface InventoryMovementsProps {
  invoices: Invoice[];
}

export function InventoryMovements({ invoices }: InventoryMovementsProps) {
  const { currentSchool } = useAuth();
  const { addToQueue } = useSyncManager();
  
  // Use standardized key with schoolId
  const movementsKey = currentSchool ? `inventory-movements_${currentSchool.id}` : 'inventory-movements';
  const { data: movements, saveData: setMovements } = useLocalStorageSync<InventoryMovement>(movementsKey, []);
  
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isAddMovementDialogOpen, setIsAddMovementDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  console.log(`📊 Carregando movimentações com chave: ${movementsKey} - ${movements.length} movimentações`);

  // Generate movements from approved invoices (entries)
  const invoiceMovements: InventoryMovement[] = invoices
    .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
    .flatMap(invoice => 
      invoice.items.map(item => ({
        id: `invoice-${invoice.id}-${item.id}`,
        type: 'entrada' as const,
        date: invoice.issueDate,
        productDescription: item.description,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        unitPrice: item.unitPrice,
        totalCost: item.totalPrice,
        invoiceId: invoice.id,
        source: 'invoice' as const,
        reason: `Entrada via Nota Fiscal ${invoice.danfeNumber || invoice.invoiceNumber}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    );

  // Combine all movements
  const allMovements = [...invoiceMovements, ...movements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter movements based on search term
  const filteredMovements = allMovements.filter(movement =>
    movement.productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExitMovement = async (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => {
    const newMovement: InventoryMovement = {
      ...movement,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMovements = [...movements, newMovement];
    setMovements(updatedMovements);
    
    // Adicionar à fila de sincronização
    await addToQueue('inventory-movements', newMovement, 'create');
    
    console.log(`✅ Nova movimentação de saída registrada: ${newMovement.id}`);
  };

  const handleAddManualMovement = async (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => {
    const newMovement: InventoryMovement = {
      ...movement,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMovements = [...movements, newMovement];
    setMovements(updatedMovements);
    
    // Adicionar à fila de sincronização
    await addToQueue('inventory-movements', newMovement, 'create');
    
    console.log(`✅ Nova movimentação manual registrada: ${newMovement.id}`);
  };

  const handleViewMovement = (movement: InventoryMovement) => {
    setSelectedMovement(movement);
  };

  // Calcular totais
  const totalEntries = allMovements.filter(m => m.type === 'entrada').length;
  const totalExits = allMovements.filter(m => m.type === 'saida').length;
  const totalValue = allMovements.reduce((sum, m) => sum + (m.totalCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allMovements.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações e busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Movimentações do Estoque</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar movimentações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button 
                onClick={() => setIsExitDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Registrar Saída
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsAddMovementDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Movimento Manual
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">
                          {searchTerm ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {format(new Date(movement.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={movement.type === 'entrada' ? 'default' : 'destructive'}
                          className={movement.type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={movement.productDescription}>
                          {movement.productDescription}
                        </div>
                        <div className="text-xs text-gray-500">
                          {movement.unitOfMeasure}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(movement.totalCost || 0)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={movement.reason}>
                          {movement.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMovement(movement)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SimpleExitMovementDialog
        open={isExitDialogOpen}
        onOpenChange={setIsExitDialogOpen}
        onSubmit={handleAddExitMovement}
        invoices={invoices}
        movements={movements}
      />

      <AddManualMovementDialog
        open={isAddMovementDialogOpen}
        onOpenChange={setIsAddMovementDialogOpen}
        onSubmit={handleAddManualMovement}
      />

      {selectedMovement && (
        <ViewMovementDialog
          movement={selectedMovement}
          open={!!selectedMovement}
          onOpenChange={(open) => !open && setSelectedMovement(null)}
        />
      )}
    </div>
  );
}
