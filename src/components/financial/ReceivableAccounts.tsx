import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReceivableAccount } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Plus, Filter, Trash2, Edit2, Download, CheckCircle, Search } from "lucide-react";
import { exportToCsv, generatePDF } from "@/lib/pdf-utils";
import { ReceiptRegistrationDialog } from "./ReceiptRegistrationDialog";
import { ReceivableInstallmentDialog } from "./ReceivableInstallmentDialog";
import { toast } from "sonner";

interface ReceivableAccountsProps {
  receivableAccounts: ReceivableAccount[];
  setReceivableAccounts: React.Dispatch<React.SetStateAction<ReceivableAccount[]>>;
  calculateFinancialSummary: () => void;
  bankAccounts?: any[];
  onNavigateToBankReconciliation?: () => void;
}

export function ReceivableAccounts({
  receivableAccounts,
  setReceivableAccounts,
  calculateFinancialSummary,
  bankAccounts = [],
  onNavigateToBankReconciliation,
}: ReceivableAccountsProps) {
  const [isAddReceivableOpen, setIsAddReceivableOpen] = useState(false);
  const [isReceiptConfirmOpen, setIsReceiptConfirmOpen] = useState(false);
  const [isInstallmentConfigOpen, setIsInstallmentConfigOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ReceivableAccount | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Form states for new receivable
  const [formData, setFormData] = useState({
    description: "",
    origin: "",
    expectedDate: new Date(),
    value: "",
    resourceType: "",
    status: "pendente" as const,
    notes: "",
    installments: 1,
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportData = () => {
    const dataToExport = filteredAccounts.map(account => ({
      Descrição: account.description,
      Origem: account.origin,
      'Tipo de Recurso': account.resourceType,
      'Data Prevista': format(new Date(account.expectedDate), 'dd/MM/yyyy'),
      Valor: formatCurrency(account.value),
      Status: account.status === 'recebido' ? 'Recebido' : 'Pendente',
      'Data de Recebimento': account.receivedDate ? format(new Date(account.receivedDate), 'dd/MM/yyyy') : '-'
    }));

    const columns = [
      { header: 'Descrição', key: 'Descrição' },
      { header: 'Origem', key: 'Origem' },
      { header: 'Tipo de Recurso', key: 'Tipo de Recurso' },
      { header: 'Data Prevista', key: 'Data Prevista' },
      { header: 'Valor', key: 'Valor' },
      { header: 'Status', key: 'Status' },
      { header: 'Data de Recebimento', key: 'Data de Recebimento' }
    ];

    try {
      exportToCsv(dataToExport, 'contas-a-receber', columns);
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error("Erro ao exportar dados.");
    }
  };
  
  const handleAddReceivable = () => {
    // Check for installments
    if (formData.installments > 1) {
      setIsInstallmentConfigOpen(true);
      return;
    }

    const newReceivable: ReceivableAccount = {
      id: `receivable-${Date.now()}`,
      schoolId: "current-school",
      description: formData.description,
      origin: formData.origin,
      expectedDate: formData.expectedDate,
      value: parseFloat(formData.value),
      resourceType: formData.resourceType,
      status: 'pendente',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setReceivableAccounts([...receivableAccounts, newReceivable]);
    setIsAddReceivableOpen(false);
    resetForm();
    calculateFinancialSummary();
  };

  const handleCreateInstallments = (installmentData: any) => {
    const newReceivables: ReceivableAccount[] = installmentData.map((installment: any) => ({
      id: `receivable-${Date.now()}-${installment.number}`,
      schoolId: "current-school",
      description: installment.description,
      origin: formData.origin,
      expectedDate: installment.expectedDate,
      value: installment.value,
      resourceType: formData.resourceType,
      status: 'pendente' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    setReceivableAccounts([...receivableAccounts, ...newReceivables]);
    setIsAddReceivableOpen(false);
    setIsInstallmentConfigOpen(false);
    resetForm();
    calculateFinancialSummary();
    toast.success(`${formData.installments} parcelas criadas com sucesso!`);
  };
  
  const handleReceiptConfirm = (receiptData: any) => {
    if (selectedAccount) {
      const updatedAccounts = receivableAccounts.map(account => 
        account.id === selectedAccount.id 
          ? { 
              ...account, 
              status: 'recebido' as const, 
              receivedDate: new Date(), 
              updatedAt: new Date(),
              bankAccountId: receiptData.bankAccountId
            }
          : account
      );
      setReceivableAccounts(updatedAccounts);
      setIsReceiptConfirmOpen(false);
      setSelectedAccount(null);
      calculateFinancialSummary();
      
      // Navigate to bank reconciliation if callback is provided
      if (onNavigateToBankReconciliation) {
        onNavigateToBankReconciliation();
      }
      
      toast.success("Recebimento registrado com sucesso!");
    }
  };
  
  const handleDeleteReceivable = (account: ReceivableAccount) => {
    if (account.status === 'recebido') {
      // If received, just remove receipt and return to pending
      const updatedAccounts = receivableAccounts.map(acc => 
        acc.id === account.id 
          ? { 
              ...acc, 
              status: 'pendente' as const, 
              receivedDate: undefined, 
              bankAccountId: undefined,
              updatedAt: new Date()
            }
          : acc
      );
      setReceivableAccounts(updatedAccounts);
      toast.success("Recebimento removido. Conta retornada para pendente.");
    } else {
      // If pending, delete completely
      setReceivableAccounts(receivableAccounts.filter(acc => acc.id !== account.id));
      toast.success("Conta excluída com sucesso.");
    }
    calculateFinancialSummary();
  };
  
  const openReceiptConfirm = (account: ReceivableAccount) => {
    setSelectedAccount(account);
    setIsReceiptConfirmOpen(true);
  };
  
  const resetForm = () => {
    setFormData({
      description: "",
      origin: "",
      expectedDate: new Date(),
      value: "",
      resourceType: "",
      status: "pendente",
      notes: "",
      installments: 1,
    });
  };
  
  // Filter receivable accounts
  const filteredAccounts = receivableAccounts.filter(account => {
    let includeAccount = true;
    
    // Filter by status
    if (filterStatus !== "all") {
      if (filterStatus === "pending" && account.status !== "pendente") {
        includeAccount = false;
      } else if (filterStatus === "received" && account.status !== "recebido") {
        includeAccount = false;
      }
    }
    
    // Filter by search term (description or origin)
    if (searchTerm && 
        !account.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !account.origin.toLowerCase().includes(searchTerm.toLowerCase())) {
      includeAccount = false;
    }
    
    // Filter by date range
    if (startDate && new Date(account.expectedDate) < startDate) {
      includeAccount = false;
    }
    
    if (endDate) {
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (new Date(account.expectedDate) > endDateWithTime) {
        includeAccount = false;
      }
    }
    
    return includeAccount;
  });
  
  // Calculate summary data
  const totalAmount = filteredAccounts.reduce((sum, account) => sum + account.value, 0);
  const pendingAmount = filteredAccounts
    .filter(account => account.status === "pendente")
    .reduce((sum, account) => sum + account.value, 0);
  const receivedAmount = filteredAccounts
    .filter(account => account.status === "recebido")
    .reduce((sum, account) => sum + account.value, 0);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-muted-foreground">{filteredAccounts.length} receitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-600">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter(a => a.status === "pendente").length} receitas pendentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(receivedAmount)}</p>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter(a => a.status === "recebido").length} receitas recebidas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Actions and Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-full md:w-auto flex-1 md:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou origem"
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="received">Recebido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-[120px] pl-3 text-left font-normal">
                  {startDate ? format(startDate, 'dd/MM/yyyy') : "Data inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-[120px] pl-3 text-left font-normal">
                  {endDate ? format(endDate, 'dd/MM/yyyy') : "Data final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setIsAddReceivableOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>
        </div>
      </div>
      
      {/* Receivable Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Receber</CardTitle>
          <CardDescription>
            Gerencie todas as receitas da sua escola.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Tipo de Recurso</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhuma receita encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map(account => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.description}</TableCell>
                    <TableCell>{account.origin}</TableCell>
                    <TableCell>{account.resourceType}</TableCell>
                    <TableCell>{format(new Date(account.expectedDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{formatCurrency(account.value)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`mr-2 h-2 w-2 rounded-full ${
                          account.status === 'recebido' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        {account.status === 'recebido' ? 'Recebido' : 'Pendente'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {account.status === 'pendente' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openReceiptConfirm(account)}
                              title="Registrar Recebimento"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteReceivable(account)}
                          title={account.status === 'recebido' ? 'Remover Recebimento' : 'Excluir'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Receivable Dialog */}
      <Dialog open={isAddReceivableOpen} onOpenChange={setIsAddReceivableOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Conta a Receber</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da nova receita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Origem</Label>
                <Input 
                  id="origin" 
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expectedDate">Data Prevista</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal`}
                    >
                      {formData.expectedDate ? format(formData.expectedDate, 'dd/MM/yyyy') : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.expectedDate}
                      onSelect={(date) => date && setFormData({...formData, expectedDate: date})}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input 
                  id="value" 
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="installments">Parcelas</Label>
                <Input 
                  id="installments" 
                  type="number"
                  min="1"
                  value={formData.installments}
                  onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="resourceType">Tipo de Recurso</Label>
                <Select 
                  value={formData.resourceType} 
                  onValueChange={(value) => setFormData({...formData, resourceType: value})}
                >
                  <SelectTrigger id="resourceType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PNAE">PNAE</SelectItem>
                    <SelectItem value="PNATE">PNATE</SelectItem>
                    <SelectItem value="Recursos Próprios">Recursos Próprios</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Input 
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="attachment">Anexar Documento (opcional)</Label>
              <Input id="attachment" type="file" />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsAddReceivableOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddReceivable}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Receipt Registration Dialog */}
      <ReceiptRegistrationDialog
        isOpen={isReceiptConfirmOpen}
        onClose={() => setIsReceiptConfirmOpen(false)}
        account={selectedAccount}
        bankAccounts={bankAccounts}
        onConfirm={handleReceiptConfirm}
      />

      {/* Installment Configuration Dialog */}
      <ReceivableInstallmentDialog
        isOpen={isInstallmentConfigOpen}
        onClose={() => setIsInstallmentConfigOpen(false)}
        formData={formData}
        onConfirm={handleCreateInstallments}
      />
    </div>
  );
}
