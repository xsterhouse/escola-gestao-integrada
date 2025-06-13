
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
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, FileDown, Eye, Edit, Trash2, AlertTriangle, Minus, ChevronDown, ChevronRight, FileText, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Invoice, InventoryMovement } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { ViewMovementDialog } from "./ViewMovementDialog";
import { AddManualMovementDialog } from "./AddManualMovementDialog";
import { ExitMovementDialog } from "./ExitMovementDialog";
import { SimpleExitMovementDialog } from "./SimpleExitMovementDialog";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { generateInventoryReportPDF } from "@/lib/inventory-pdf-utils";
import { getAllProductsStock } from "@/lib/inventory-calculations";
import { useAuth } from "@/contexts/AuthContext";

interface InventoryMovementsProps {
  invoices: Invoice[];
}

type ViewMode = 'all' | 'by-invoice' | 'by-origin';

interface GroupedInvoiceMovements {
  invoice: Invoice;
  movements: InventoryMovement[];
}

export function InventoryMovements({ invoices }: InventoryMovementsProps) {
  const { currentSchool, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [isAddManualMovementOpen, setIsAddManualMovementOpen] = useState(false);
  const [isExitMovementOpen, setIsExitMovementOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['invoices', 'manual']));
  
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
        status: 'entrada' as const,
        reason: 'Entrada via nota fiscal',
        createdAt: new Date(invoice.createdAt),
        updatedAt: new Date(invoice.updatedAt),
      }))
    );
  
  // Combine all movements (entries from invoices + manual movements)
  const allMovements = [...entriesFromInvoices, ...manualMovements];
  
  // Filter movements based on search term
  const filteredMovements = allMovements.filter(
    (movement) =>
      movement.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group movements by invoice
  const groupedByInvoice = (): GroupedInvoiceMovements[] => {
    const approvedInvoices = invoices.filter(invoice => invoice.status === 'aprovada' && invoice.isActive);
    
    return approvedInvoices.map(invoice => ({
      invoice,
      movements: entriesFromInvoices.filter(movement => movement.invoiceId === invoice.id)
        .filter(movement => movement.productDescription.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(group => group.movements.length > 0);
  };

  // Get manual movements (filtered)
  const getManualMovements = () => {
    return manualMovements.filter(movement => 
      movement.productDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const toggleInvoiceExpansion = (invoiceId: string) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedInvoices(newExpanded);
  };

  const toggleSectionExpansion = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const expandAllInvoices = () => {
    const allInvoiceIds = groupedByInvoice().map(group => group.invoice.id);
    setExpandedInvoices(new Set(allInvoiceIds));
  };

  const collapseAllInvoices = () => {
    setExpandedInvoices(new Set());
  };
  
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
      status: movement.type === 'saida' ? 'saida' : 'entrada',
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

  const handleAddExitMovement = (movement: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt">) => {
    console.log("📥 Recebendo movimento de saída:", movement);
    
    const newMovement: InventoryMovement = {
      ...movement,
      id: `exit-${Date.now()}`,
      source: 'manual',
      status: 'saida',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setManualMovements([...manualMovements, newMovement]);
    
    toast({
      title: "Saída registrada",
      description: "A saída foi registrada com sucesso.",
    });
    
    setIsExitMovementOpen(false);
    console.log("✅ Saída registrada com sucesso:", newMovement.id);
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
      'Origem',
      'Status'
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
      movement.source === 'invoice' ? 'Nota Fiscal' : 'Sistema',
      movement.status === 'saida' ? 'SAÍDA' : 'ENTRADA'
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
    if (!currentSchool || !user) {
      toast({
        title: "Erro",
        description: "Informações do usuário não encontradas.",
        variant: "destructive"
      });
      return;
    }

    const stockData = getAllProductsStock(invoices, manualMovements);
    
    generateInventoryReportPDF({
      schoolName: currentSchool.name,
      userName: user.name,
      date: new Date().toLocaleDateString('pt-BR'),
      reportType: 'movements',
      movements: filteredMovements,
      stockData
    });
    
    toast({
      title: "Relatório gerado",
      description: "O relatório PDF foi gerado com sucesso.",
    });
  };

  // Render movements table
  const renderMovementsTable = (movements: InventoryMovement[]) => (
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
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                Nenhuma movimentação encontrada
              </TableCell>
            </TableRow>
          ) : (
            movements.map((movement) => (
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
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    movement.status === 'saida' ? 
                    'bg-red-100 text-red-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {movement.status === 'saida' ? 'SAÍDA' : 'ENTRADA'}
                  </span>
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
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Movimentação de Produtos</CardTitle>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsExitMovementOpen(true)} variant="outline" size="sm">
            <Minus className="h-4 w-4 mr-1" />
            Registrar Saída
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Input
                placeholder="Buscar por produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Visualização:</span>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('all')}
              >
                Todas
              </Button>
              <Button
                variant={viewMode === 'by-invoice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('by-invoice')}
              >
                Por Nota Fiscal
              </Button>
              <Button
                variant={viewMode === 'by-origin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('by-origin')}
              >
                Por Origem
              </Button>
            </div>
          </div>

          {viewMode === 'by-invoice' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAllInvoices}>
                Expandir Todas
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAllInvoices}>
                Recolher Todas
              </Button>
            </div>
          )}
        </div>

        {/* Summary info */}
        <div className="mb-4 text-sm text-muted-foreground">
          {viewMode === 'all' && (
            <span>Total de movimentações: {filteredMovements.length}</span>
          )}
          {viewMode === 'by-invoice' && (
            <span>
              {groupedByInvoice().length} notas fiscais • {filteredMovements.filter(m => m.source === 'invoice').length} itens de NF • {getManualMovements().length} movimentações manuais
            </span>
          )}
          {viewMode === 'by-origin' && (
            <span>
              {filteredMovements.filter(m => m.source === 'invoice').length} itens de NF • {getManualMovements().length} movimentações manuais
            </span>
          )}
        </div>

        {/* Render based on view mode */}
        {viewMode === 'all' && renderMovementsTable(filteredMovements)}

        {viewMode === 'by-invoice' && (
          <div className="space-y-4">
            {groupedByInvoice().map((group) => (
              <Card key={group.invoice.id} className="border">
                <Collapsible
                  open={expandedInvoices.has(group.invoice.id)}
                  onOpenChange={() => toggleInvoiceExpansion(group.invoice.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedInvoices.has(group.invoice.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <h4 className="font-medium">
                              NF {group.invoice.danfeNumber} - {group.invoice.supplier.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {format(group.invoice.issueDate, 'dd/MM/yyyy')} • {group.movements.length} itens • {' '}
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(group.invoice.totalValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {renderMovementsTable(group.movements)}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}

            {getManualMovements().length > 0 && (
              <Card className="border">
                <Collapsible
                  open={expandedSections.has('manual')}
                  onOpenChange={() => toggleSectionExpansion('manual')}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedSections.has('manual') ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <User className="h-4 w-4 text-yellow-600" />
                          <div>
                            <h4 className="font-medium">Movimentações Manuais</h4>
                            <p className="text-sm text-muted-foreground">
                              {getManualMovements().length} movimentações registradas manualmente
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {renderMovementsTable(getManualMovements())}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}
          </div>
        )}

        {viewMode === 'by-origin' && (
          <div className="space-y-6">
            {/* Invoice Items Section */}
            <Card className="border">
              <Collapsible
                open={expandedSections.has('invoices')}
                onOpenChange={() => toggleSectionExpansion('invoices')}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedSections.has('invoices') ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Itens de Notas Fiscais</h4>
                          <p className="text-sm text-muted-foreground">
                            {filteredMovements.filter(m => m.source === 'invoice').length} itens de {groupedByInvoice().length} notas fiscais
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {renderMovementsTable(filteredMovements.filter(m => m.source === 'invoice'))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Manual Movements Section */}
            <Card className="border">
              <Collapsible
                open={expandedSections.has('manual')}
                onOpenChange={() => toggleSectionExpansion('manual')}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedSections.has('manual') ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <User className="h-4 w-4 text-yellow-600" />
                        <div>
                          <h4 className="font-medium">Movimentações Manuais</h4>
                          <p className="text-sm text-muted-foreground">
                            {getManualMovements().length} movimentações registradas manualmente
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {renderMovementsTable(getManualMovements())}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        )}
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

      <SimpleExitMovementDialog
        open={isExitMovementOpen}
        onOpenChange={setIsExitMovementOpen}
        onSubmit={handleAddExitMovement}
        invoices={invoices}
        movements={manualMovements}
      />
    </Card>
  );
}
