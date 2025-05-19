
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentAccount } from "@/lib/types";
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
import { ptBR } from "date-fns/locale";
import { Filter, Plus, FilePlus, Trash2, Edit2, Download, Upload, CheckCircle, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToCsv, generatePDF } from "@/lib/pdf-utils";

interface PayableAccountsProps {
  paymentAccounts: PaymentAccount[];
  setPaymentAccounts: React.Dispatch<React.SetStateAction<PaymentAccount[]>>;
  calculateFinancialSummary: () => void;
}

export function PayableAccounts({
  paymentAccounts,
  setPaymentAccounts,
  calculateFinancialSummary,
}: PayableAccountsProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [isImportInvoiceOpen, setIsImportInvoiceOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Form states for new payment
  const [formData, setFormData] = useState({
    description: "",
    supplier: "",
    dueDate: new Date(),
    value: "",
    expenseType: "",
    resourceCategory: "",
    status: "a_pagar" as const,
    notes: "",
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const handleAddPayment = () => {
    const newPayment: PaymentAccount = {
      id: `payment-${Date.now()}`,
      schoolId: "current-school", // This would come from context in real implementation
      description: formData.description,
      supplier: formData.supplier,
      dueDate: formData.dueDate,
      value: parseFloat(formData.value),
      expenseType: formData.expenseType,
      resourceCategory: formData.resourceCategory,
      status: 'a_pagar',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPaymentAccounts([...paymentAccounts, newPayment]);
    setIsAddPaymentOpen(false);
    resetForm();
    calculateFinancialSummary();
  };
  
  const handlePaymentConfirm = () => {
    if (selectedAccount) {
      const updatedAccounts = paymentAccounts.map(account => 
        account.id === selectedAccount.id 
          ? { ...account, status: 'pago' as const, paymentDate: new Date(), updatedAt: new Date() }
          : account
      );
      setPaymentAccounts(updatedAccounts);
      setIsPaymentConfirmOpen(false);
      setSelectedAccount(null);
      calculateFinancialSummary();
    }
  };
  
  const handleDeletePayment = (id: string) => {
    setPaymentAccounts(paymentAccounts.filter(account => account.id !== id));
    calculateFinancialSummary();
  };
  
  const openPaymentConfirm = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setIsPaymentConfirmOpen(true);
  };
  
  const resetForm = () => {
    setFormData({
      description: "",
      supplier: "",
      dueDate: new Date(),
      value: "",
      expenseType: "",
      resourceCategory: "",
      status: "a_pagar",
      notes: "",
    });
  };
  
  const exportData = () => {
    const exportData = paymentAccounts.map(p => ({
      descricao: p.description,
      fornecedor: p.supplier,
      vencimento: format(new Date(p.dueDate), 'dd/MM/yyyy'),
      valor: formatCurrency(p.value),
      tipo_despesa: p.expenseType,
      categoria_recurso: p.resourceCategory,
      status: p.status === 'a_pagar' ? 'A Pagar' : 'Pago',
      data_pagamento: p.paymentDate ? format(new Date(p.paymentDate), 'dd/MM/yyyy') : '-'
    }));
    
    exportToCsv(exportData, 'contas_a_pagar', [
      { header: 'Descrição', key: 'descricao' },
      { header: 'Fornecedor', key: 'fornecedor' },
      { header: 'Vencimento', key: 'vencimento' },
      { header: 'Valor', key: 'valor' },
      { header: 'Tipo de Despesa', key: 'tipo_despesa' },
      { header: 'Categoria de Recurso', key: 'categoria_recurso' },
      { header: 'Status', key: 'status' },
      { header: 'Data de Pagamento', key: 'data_pagamento' }
    ]);
  };
  
  // Filter payment accounts
  const filteredAccounts = paymentAccounts.filter(account => {
    let includeAccount = true;
    
    // Filter by status
    if (filterStatus !== "all") {
      if (filterStatus === "pending" && account.status !== "a_pagar") {
        includeAccount = false;
      } else if (filterStatus === "paid" && account.status !== "pago") {
        includeAccount = false;
      }
    }
    
    // Filter by search term (description or supplier)
    if (searchTerm && 
        !account.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !account.supplier.toLowerCase().includes(searchTerm.toLowerCase())) {
      includeAccount = false;
    }
    
    // Filter by date range
    if (startDate && new Date(account.dueDate) < startDate) {
      includeAccount = false;
    }
    
    if (endDate) {
      const endDateWithTime = new Date(endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (new Date(account.dueDate) > endDateWithTime) {
        includeAccount = false;
      }
    }
    
    return includeAccount;
  });
  
  // Calculate summary data
  const totalAmount = filteredAccounts.reduce((sum, account) => sum + account.value, 0);
  const pendingAmount = filteredAccounts
    .filter(account => account.status === "a_pagar")
    .reduce((sum, account) => sum + account.value, 0);
  const paidAmount = filteredAccounts
    .filter(account => account.status === "pago")
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
            <p className="text-xs text-muted-foreground">{filteredAccounts.length} contas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-600">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter(a => a.status === "a_pagar").length} contas a pagar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter(a => a.status === "pago").length} contas pagas
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
                placeholder="Buscar por descrição ou fornecedor"
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
                <SelectItem value="pending">A Pagar</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
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
          <Button variant="outline" onClick={() => setIsImportInvoiceOpen(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            Importar NF
          </Button>
          <Button onClick={() => setIsAddPaymentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </div>
      
      {/* Payable Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Pagar</CardTitle>
          <CardDescription>
            Gerencie todas as contas a pagar da sua escola.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Tipo de Despesa</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhuma conta encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map(account => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.description}</TableCell>
                    <TableCell>{account.supplier}</TableCell>
                    <TableCell>{account.expenseType}</TableCell>
                    <TableCell>{format(new Date(account.dueDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{formatCurrency(account.value)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`mr-2 h-2 w-2 rounded-full ${
                          account.status === 'pago' ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        {account.status === 'pago' ? 'Pago' : 'A Pagar'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {account.status === 'a_pagar' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openPaymentConfirm(account)}
                              title="Registrar Pagamento"
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
                          onClick={() => handleDeletePayment(account.id)}
                          title="Excluir"
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
      
      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Conta a Pagar</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da nova conta a ser paga.
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
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input 
                  id="supplier" 
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal`}
                    >
                      {formData.dueDate ? format(formData.dueDate, 'dd/MM/yyyy') : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => date && setFormData({...formData, dueDate: date})}
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
                <Label htmlFor="expenseType">Tipo de Despesa</Label>
                <Select 
                  value={formData.expenseType} 
                  onValueChange={(value) => setFormData({...formData, expenseType: value})}
                >
                  <SelectTrigger id="expenseType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alimentação">Alimentação</SelectItem>
                    <SelectItem value="Material Didático">Material Didático</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Água">Água</SelectItem>
                    <SelectItem value="Energia">Energia</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="resourceCategory">Categoria de Recurso</Label>
              <Select 
                value={formData.resourceCategory} 
                onValueChange={(value) => setFormData({...formData, resourceCategory: value})}
              >
                <SelectTrigger id="resourceCategory">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PNAE">PNAE</SelectItem>
                  <SelectItem value="PNATE">PNATE</SelectItem>
                  <SelectItem value="Recursos Próprios">Recursos Próprios</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="attachment">Anexar Comprovante (opcional)</Label>
              <Input id="attachment" type="file" />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsAddPaymentOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddPayment}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Confirmation Dialog */}
      <Dialog open={isPaymentConfirmOpen} onOpenChange={setIsPaymentConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              Confirme os detalhes para registrar o pagamento.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Descrição</Label>
                  <Input value={selectedAccount.description} readOnly />
                </div>
                <div>
                  <Label>Fornecedor</Label>
                  <Input value={selectedAccount.supplier} readOnly />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vencimento</Label>
                  <Input value={format(new Date(selectedAccount.dueDate), 'dd/MM/yyyy')} readOnly />
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input value={formatCurrency(selectedAccount.value)} readOnly />
                </div>
              </div>
              
              <div className="grid grid-cols-1">
                <div>
                  <Label>Data de Pagamento</Label>
                  <Input value={format(new Date(), 'dd/MM/yyyy')} readOnly />
                </div>
              </div>
              
              <div>
                <Label htmlFor="attachment">Anexar Comprovante (opcional)</Label>
                <Input id="attachment" type="file" />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handlePaymentConfirm}>Confirmar Pagamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Invoice Dialog */}
      <Dialog open={isImportInvoiceOpen} onOpenChange={setIsImportInvoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Nota Fiscal</DialogTitle>
            <DialogDescription>
              Importe uma nota fiscal para criar automaticamente uma conta a pagar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-300" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="invoice-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-primary"
                  >
                    <span>Fazer upload de arquivo</span>
                    <input id="invoice-upload" name="invoice-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">XML, PDF até 10MB</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportInvoiceOpen(false)}>Cancelar</Button>
            <Button>Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
