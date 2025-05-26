
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
import { Search, FileDown, Plus, Eye, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Invoice, InventoryMovement } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { ViewMovementDialog } from "./ViewMovementDialog";
import { AddManualMovementDialog } from "./AddManualMovementDialog";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";

interface InventoryMovementsProps {
  invoices: Invoice[];
}

export function InventoryMovements({ invoices }: InventoryMovementsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [isAddManualMovementOpen, setIsAddManualMovementOpen] = useState(false);
  
  const { data: manualMovements, saveData: setManualMovements } = useLocalStorageSync<InventoryMovement>('inventory-movements', []);
  
  // Create movements from approved invoices only
  const entriesFromInvoices: InventoryMovement[] = invoices
    .filter(invoice => invoice.status === 'aprovada' && invoice.isActive)
    .flatMap(invoice => 
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
        source: 'invoice' as const,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      }))
    );
  
  // Combine all movements (entries from invoices + manual movements)
  const allMovements = [...entriesFromInvoices, ...manualMovements];
  
  // Filter movements based on search term
  const filteredMovements = allMovements.filter(
    (movement) =>
      movement.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleViewMovement = (movement: InventoryMovement) => {
    setSelectedMovement(movement);
  };
  
  const handleDeleteMovement = (movementId: string) => {
    const movement = allMovements.find(m => m.id === movementId);
    if (movement?.source === 'manual' || movement?.type === 'saida') {
      const updatedManualMovements = manualMovements.filter(m => m.id !== movementId);
      setManualMovements(updatedManualMovements);
      toast({
        title: "Movimento excluído",
        description: "O movimento foi excluído com sucesso.",
      });
    } else {
      toast({
        title: "Não é possível excluir",
        description: "Apenas movimentos manuais ou de saída podem ser excluídos.",
        variant: "destructive"
      });
    }
  };
  
  const handleEditMovement = (movementId: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A edição de movimentos será implementada em breve.",
    });
  };
  
  const handleAddManualMovement = (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => {
    // Validate that the product exists in inventory for outgoing movements
    const productExists = entriesFromInvoices.some(entry => 
      entry.productDescription === movement.productDescription &&
      entry.unitOfMeasure === movement.unitOfMeasure
    );
    
    if (!productExists && movement.type === 'saida') {
      toast({
        title: "Produto não encontrado",
        description: "Não é possível dar baixa em produto que não existe no estoque.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate available stock for outgoing movements
    if (movement.type === 'saida') {
      const totalEntries = entriesFromInvoices
        .filter(entry => entry.productDescription === movement.productDescription)
        .reduce((sum, entry) => sum + entry.quantity, 0);
      
      const totalExits = manualMovements
        .filter(mov => mov.productDescription === movement.productDescription && mov.type === 'saida')
        .reduce((sum, mov) => sum + mov.quantity, 0);
      
      const availableStock = totalEntries - totalExits;
      
      if (movement.quantity > availableStock) {
        toast({
          title: "Estoque insuficiente",
          description: `Estoque disponível: ${availableStock} ${movement.unitOfMeasure}`,
          variant: "destructive"
        });
        return;
      }
    }
    
    const newMovement: InventoryMovement = {
      ...movement,
      id: `manual-${Date.now()}`,
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setManualMovements([...manualMovements, newMovement]);
    
    toast({
      title: "Movimentação registrada",
      description: "O movimento foi registrado com sucesso.",
    });
    
    setIsAddManualMovementOpen(false);
  };
  
  const handleExportCsv = () => {
    const csvHeaders = [
      'Tipo',
      'Data',
      'Produto',
      'Quantidade',
      'Unidade',
      'Valor Unitário',
      'Custo Total',
      'Origem'
    ];
    
    const csvData = filteredMovements.map(movement => [
      movement.type === 'entrada' ? 'Entrada' : 'Saída',
      format(movement.date, 'dd/MM/yyyy'),
      movement.productDescription,
      movement.quantity.toString(),
      movement.unitOfMeasure,
      movement.unitPrice.toFixed(2),
      movement.totalCost.toFixed(2),
      movement.source === 'manual' ? 'Manual' : 
      movement.source === 'invoice' ? 'Nota Fiscal' : 'Sistema'
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `movimentacoes-estoque-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: "Arquivo CSV gerado com sucesso.",
    });
  };
  
  const handleExportPdf = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exportação em PDF será implementada em breve.",
    });
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
                          <AlertTriangle className="h-4 w-4 ml-1 text-yellow-500" aria-label="Item inserido manualmente" />
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
                        {(movement.source === 'manual' || movement.type === 'saida') && (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditMovement(movement.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteMovement(movement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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
        invoices={invoices}
        ProductAutocomplete={ProductAutocomplete}
      />
    </Card>
  );
}
