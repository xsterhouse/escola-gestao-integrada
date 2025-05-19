
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileDown, Minus, Eye, Plus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Invoice, InventoryMovement } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ViewMovementDialog } from "./ViewMovementDialog";
import { AddManualMovementDialog } from "./AddManualMovementDialog";
import { 
  generateInventoryPDF,
  generateInventoryMovementsPDF, 
  exportToCsv 
} from "@/lib/pdf-utils";

interface InventoryMovementsProps {
  invoices: Invoice[];
}

export function InventoryMovements({ invoices }: InventoryMovementsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [isAddManualMovementOpen, setIsAddManualMovementOpen] = useState(false);
  
  // Create movements from invoices
  const entriesFromInvoices = invoices.flatMap(invoice => 
    invoice.items.map(item => ({
      id: `movement-${item.id}`,
      type: 'entrada' as const,
      date: invoice.issueDate,
      productDescription: item.description,
      quantity: item.quantity,
      unitOfMeasure: item.unitOfMeasure,
      unitPrice: item.unitPrice,
      totalCost: item.totalPrice,
      invoiceId: invoice.id,
      source: 'invoice',
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }))
  );
  
  // Mock some outgoing inventory movements
  const mockOutgoingMovements: InventoryMovement[] = [
    {
      id: "out-1",
      type: 'saida',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      productDescription: "Caneta Esferográfica Azul",
      quantity: 10,
      unitOfMeasure: "Un",
      unitPrice: 2.5,
      totalCost: 25,
      requestId: "req-001",
      source: 'system',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "out-2",
      type: 'saida',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      productDescription: "Papel Sulfite A4",
      quantity: 3,
      unitOfMeasure: "Pct",
      unitPrice: 20,
      totalCost: 60,
      requestId: "req-002",
      source: 'system',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "manual-1",
      type: 'entrada',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      productDescription: "Arroz Tipo 1",
      quantity: 50,
      unitOfMeasure: "Kg",
      unitPrice: 5.50,
      totalCost: 275,
      source: 'manual',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  ];
  
  // Combine all movements
  const [allMovements, setAllMovements] = useState<InventoryMovement[]>([
    ...entriesFromInvoices,
    ...mockOutgoingMovements
  ]);
  
  // Filter movements based on search term
  const filteredMovements = allMovements.filter(
    (movement) =>
      movement.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleViewMovement = (movement: InventoryMovement) => {
    setSelectedMovement(movement);
  };
  
  const handleMovementOut = (movementId: string) => {
    // Simulate creating an outgoing movement
    toast({
      title: "Baixa registrada",
      description: "A baixa do produto foi registrada com sucesso.",
    });
  };
  
  const handleAddManualMovement = (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => {
    const newMovement: InventoryMovement = {
      ...movement,
      id: `manual-${Date.now()}`,
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setAllMovements([...allMovements, newMovement]);
    
    toast({
      title: "Movimentação manual registrada",
      description: "O item foi adicionado manualmente ao inventário.",
      variant: "default",
    });
    
    setIsAddManualMovementOpen(false);
  };
  
  const handleExportCsv = () => {
    // Export to CSV
    exportToCsv(filteredMovements, 'movimentacoes-estoque', [
      { header: 'Tipo', key: 'type' },
      { header: 'Data', key: 'date' },
      { header: 'Produto', key: 'productDescription' },
      { header: 'Quantidade', key: 'quantity' },
      { header: 'Unidade', key: 'unitOfMeasure' },
      { header: 'Valor Unitário', key: 'unitPrice' },
      { header: 'Custo Total', key: 'totalCost' },
      { header: 'Origem', key: 'source' }
    ]);
  };
  
  const handleExportPdf = () => {
    // Export to PDF
    generateInventoryMovementsPDF(filteredMovements);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Movimentação de Produtos</CardTitle>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddManualMovementOpen(true)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Manual
          </Button>
          <Button onClick={handleExportCsv} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button onClick={handleExportPdf} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Input
            placeholder="Buscar por produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Custo Total</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        movement.type === 'entrada' ? 
                        'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </TableCell>
                    <TableCell>{format(movement.date, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{movement.productDescription}</TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.unitOfMeasure}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(movement.unitPrice)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(movement.totalCost)}
                    </TableCell>
                    <TableCell>
                      {movement.source === 'manual' ? (
                        <div className="flex items-center">
                          <span>Manual</span>
                          <AlertTriangle className="h-4 w-4 ml-1 text-yellow-500" title="Item inserido manualmente" />
                        </div>
                      ) : movement.source === 'invoice' ? (
                        <span>Nota Fiscal</span>
                      ) : (
                        <span>Sistema</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewMovement(movement)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {movement.type === 'entrada' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleMovementOut(movement.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {selectedMovement && (
        <ViewMovementDialog
          movement={selectedMovement}
          open={!!selectedMovement}
          onOpenChange={() => setSelectedMovement(null)}
        />
      )}

      <AddManualMovementDialog
        open={isAddManualMovementOpen}
        onOpenChange={setIsAddManualMovementOpen}
        onSubmit={handleAddManualMovement}
      />
    </Card>
  );
}
