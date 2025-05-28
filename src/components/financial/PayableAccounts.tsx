import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentAccount, Invoice } from "@/lib/types";
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
import { exportToCsv, generatePDF } from "@/lib/pdf-utils";
import { ImportInvoiceFromXmlDialog } from "./ImportInvoiceFromXmlDialog";
import { PaymentRegistrationDialog } from "./PaymentRegistrationDialog";
import { InstallmentConfigDialog } from "./InstallmentConfigDialog";
import { DuplicatePaymentDialog } from "./DuplicatePaymentDialog";
import { toast } from "sonner";

interface PayableAccountsProps {
  paymentAccounts: PaymentAccount[];
  setPaymentAccounts: React.Dispatch<React.SetStateAction<PaymentAccount[]>>;
  calculateFinancialSummary: () => void;
  bankAccounts?: any[];
  onNavigateToBankReconciliation?: () => void;
  resourceCategories: string[];
  expenseTypes: string[];
  onUpdatePayment?: (updatedPayment: PaymentAccount) => void;
}

export function PayableAccounts({
  paymentAccounts,
  setPaymentAccounts,
  calculateFinancialSummary,
  bankAccounts = [],
  onNavigateToBankReconciliation,
  resourceCategories,
  expenseTypes,
  onUpdatePayment,
}: PayableAccountsProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [isDuplicatePaymentOpen, setIsDuplicatePaymentOpen] = useState(false);
  const [isImportInvoiceOpen, setIsImportInvoiceOpen] = useState(false);
  const [isInstallmentConfigOpen, setIsInstallmentConfigOpen] = useState(false);
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
    installments: 1,
  });

  // Load saved invoices from localStorage to check for XML imports
  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('invoices');
    if (saved) {
      setSavedInvoices(JSON.parse(saved));
    }
  }, []);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Check for duplicate payments
  const checkDuplicatePayment = (account: PaymentAccount): boolean => {
    const existingPayments = paymentAccounts.filter(
      payment => payment.id !== account.id && 
                 payment.status === 'pago' && 
                 payment.supplier === account.supplier &&
                 payment.description === account.description &&
                 payment.value === account.value
    );
    return existingPayments.length > 0;
  };
  
  const handleAddPayment = () => {
    // Check for installments
    if (formData.installments > 1) {
      setIsInstallmentConfigOpen(true);
      return;
    }

    const newPayment: PaymentAccount = {
      id: `payment-${Date.now()}`,
      schoolId: "current-school",
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

  const handleCreateInstallments = (installmentData: any) => {
    const baseValue = parseFloat(formData.value);
    const installmentValue = baseValue / formData.installments;
    const newPayments: PaymentAccount[] = [];

    for (let i = 0; i < formData.installments; i++) {
      const dueDate = new Date(formData.dueDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const payment: PaymentAccount = {
        id: `payment-${Date.now()}-${i}`,
        schoolId: "current-school",
        description: `${formData.description} (${i + 1}/${formData.installments})`,
        supplier: formData.supplier,
        dueDate,
        value: installmentValue,
        expenseType: formData.expenseType,
        resourceCategory: formData.resourceCategory,
        status: 'a_pagar',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      newPayments.push(payment);
    }
    
    setPaymentAccounts([...paymentAccounts, ...newPayments]);
    setIsAddPaymentOpen(false);
    setIsInstallmentConfigOpen(false);
    resetForm();
    calculateFinancialSummary();
    toast.success(`${formData.installments} parcelas criadas com sucesso!`);
  };
  
  const handlePaymentConfirm = (paymentData: any) => {
    if (selectedAccount) {
      // Check for duplicate payment
      if (checkDuplicatePayment(selectedAccount)) {
        setIsDuplicatePaymentOpen(true);
        return;
      }

      processPayment(paymentData, false);
    }
  };

  const handleDuplicatePaymentConfirm = (paymentData: any, justification: string) => {
    processPayment(paymentData, true, justification);
    setIsDuplicatePaymentOpen(false);
  };

  const processPayment = (paymentData: any, isDuplicate: boolean = false, justification?: string) => {
    if (selectedAccount) {
      const updatedAccount = { 
        ...selectedAccount, 
        status: 'pago' as const, 
        paymentDate: new Date(), 
        updatedAt: new Date(),
        bankAccountId: paymentData.bankAccountId,
        isDuplicate,
        duplicateJustification: justification
      };

      // Update the payment account
      const updatedAccounts = paymentAccounts.map(account => 
        account.id === selectedAccount.id ? updatedAccount : account
      );
      setPaymentAccounts(updatedAccounts);
      
      // Call the onUpdatePayment callback to trigger automatic bank transaction
      if (onUpdatePayment) {
        onUpdatePayment(updatedAccount);
      }
      
      setIsPaymentConfirmOpen(false);
      setSelectedAccount(null);
      calculateFinancialSummary();
      
      // Navigate to bank reconciliation if callback is provided
      if (onNavigateToBankReconciliation) {
        onNavigateToBankReconciliation();
      }
      
      const message = isDuplicate 
        ? "Pagamento duplicado registrado com sucesso! Lançamento automático criado na conciliação bancária com alerta de duplicidade."
        : "Pagamento registrado com sucesso! Lançamento automático criado na conciliação bancária.";
      
      toast.success(message);
    }
  };

  const handleEditPayment = (updatedAccount: PaymentAccount) => {
    const updatedAccounts = paymentAccounts.map(account => 
      account.id === updatedAccount.id ? updatedAccount : account
    );
    setPaymentAccounts(updatedAccounts);
    setIsEditPaymentOpen(false);
    setSelectedAccount(null);
    calculateFinancialSummary();
    toast.success("Conta atualizada com sucesso!");
  };
  
  const handleDeletePayment = (account: PaymentAccount) => {
    if (account.status === 'pago') {
      // If paid, just remove payment and return to pending
      const updatedAccounts = paymentAccounts.map(acc => 
        acc.id === account.id 
          ? { 
              ...acc, 
              status: 'a_pagar' as const, 
              paymentDate: undefined, 
              bankAccountId: undefined,
              isDuplicate: undefined,
              duplicateJustification: undefined,
              updatedAt: new Date()
            }
          : acc
      );
      setPaymentAccounts(updatedAccounts);
      toast.success("Pagamento removido. Conta retornada para pendente.");
    } else {
      // If pending, delete completely
      setPaymentAccounts(paymentAccounts.filter(acc => acc.id !== account.id));
      toast.success("Conta excluída com sucesso.");
    }
    calculateFinancialSummary();
  };
  
  const openPaymentConfirm = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setIsPaymentConfirmOpen(true);
  };

  const openEditPayment = (account: PaymentAccount) => {
    setSelectedAccount(account);
    setIsEditPaymentOpen(true);
  };

  const handleImportFromXml = (invoice: Invoice) => {
    // Create payment account from imported invoice
    const newPayment: PaymentAccount = {
      id: `payment-xml-${Date.now()}`,
      schoolId: "current-school",
      description: `NF ${invoice.danfeNumber} - ${invoice.supplier.name}`,
      supplier: invoice.supplier.name,
      dueDate: new Date(invoice.issueDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from issue
      value: invoice.totalValue,
      expenseType: "Outros", // Default, can be changed later
      resourceCategory: "Recursos Próprios", // Default, can be changed later
      status: 'a_pagar',
      invoiceId: invoice.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPaymentAccounts([...paymentAccounts, newPayment]);
    calculateFinancialSummary();
    toast.success("Conta a pagar criada a partir do XML importado!");
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
      installments: 1,
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
            Importar XML
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {account.description}
                        {account.isDuplicate && (
                          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                            Duplicado
                          </span>
                        )}
                      </div>
                    </TableCell>
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
                              onClick={() => openEditPayment(account)}
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePayment(account)}
                          title={account.status === 'pago' ? 'Remover Pagamento' : 'Excluir'}
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
            
            <div className="grid grid-cols-2 gap-4">
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
                    {expenseTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {resourceCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
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
      
      {/* Payment Registration Dialog */}
      <PaymentRegistrationDialog
        isOpen={isPaymentConfirmOpen}
        onClose={() => setIsPaymentConfirmOpen(false)}
        account={selectedAccount}
        bankAccounts={bankAccounts}
        onConfirm={handlePaymentConfirm}
      />

      {/* Edit Payment Dialog */}
      <PaymentRegistrationDialog
        isOpen={isEditPaymentOpen}
        onClose={() => setIsEditPaymentOpen(false)}
        account={selectedAccount}
        bankAccounts={bankAccounts}
        onConfirm={handleEditPayment}
        isEditMode={true}
        onEdit={handleEditPayment}
      />

      {/* Duplicate Payment Dialog */}
      <DuplicatePaymentDialog
        isOpen={isDuplicatePaymentOpen}
        onClose={() => setIsDuplicatePaymentOpen(false)}
        account={selectedAccount}
        bankAccounts={bankAccounts}
        onConfirm={handleDuplicatePaymentConfirm}
      />

      {/* Installment Configuration Dialog */}
      <InstallmentConfigDialog
        isOpen={isInstallmentConfigOpen}
        onClose={() => setIsInstallmentConfigOpen(false)}
        formData={formData}
        onConfirm={handleCreateInstallments}
      />
      
      {/* Import Invoice Dialog */}
      <ImportInvoiceFromXmlDialog
        isOpen={isImportInvoiceOpen}
        onClose={() => setIsImportInvoiceOpen(false)}
        savedInvoices={savedInvoices}
        onImport={handleImportFromXml}
      />
    </div>
  );
}
