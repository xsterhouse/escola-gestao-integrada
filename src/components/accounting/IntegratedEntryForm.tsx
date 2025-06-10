
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Save, Zap, FileText, DollarSign, Building, Search, Trash2 } from "lucide-react";
import { AccountingEntry, Invoice, PaymentAccount, ReceivableAccount, BankTransaction } from "@/lib/types";
import { accountingAutomationService } from "@/services/accountingAutomationService";
import { useAuth } from "@/contexts/AuthContext";
import { formatAccountMask, validateAccountCode, isValidAccountFormat } from "@/utils/accountMask";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function IntegratedEntryForm() {
  const [activeTab, setActiveTab] = useState("manual");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    debitAccount: "",
    debitValue: "",
    debitDescription: "",
    debitHistory: "",
    creditAccount: "",
    creditValue: "",
    creditDescription: "",
    creditHistory: "",
    totalValue: "",
    entryType: "manual" as const
  });
  
  const [automaticEntries, setAutomaticEntries] = useState({
    pendingInvoices: [] as Invoice[],
    pendingPayments: [] as PaymentAccount[],
    pendingReceivables: [] as ReceivableAccount[],
    pendingTransactions: [] as BankTransaction[]
  });

  const [reconciledTransactions, setReconciledTransactions] = useState<BankTransaction[]>([]);
  const [savedAutomaticEntries, setSavedAutomaticEntries] = useState<AccountingEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<BankTransaction[]>([]);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadPendingItems();
    loadReconciledTransactions();
    loadSavedAutomaticEntries();
  }, []);

  const loadPendingItems = () => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]')
      .filter((invoice: Invoice) => 
        invoice.status === 'aprovada' && 
        !accountingAutomationService.entryExistsForDocument('invoices', invoice.id)
      );

    const payments = JSON.parse(localStorage.getItem('paymentAccounts') || '[]')
      .filter((payment: PaymentAccount) => 
        payment.status === 'pago' && 
        !accountingAutomationService.entryExistsForDocument('financial', payment.id)
      );

    const receivables = JSON.parse(localStorage.getItem('receivableAccounts') || '[]')
      .filter((receivable: ReceivableAccount) => 
        receivable.status === 'recebido' && 
        !accountingAutomationService.entryExistsForDocument('financial', receivable.id)
      );

    const transactions = JSON.parse(localStorage.getItem('bankTransactions') || '[]')
      .filter((transaction: BankTransaction) => 
        transaction.reconciliationStatus === 'pendente' && 
        !accountingAutomationService.entryExistsForDocument('financial', transaction.id)
      );

    setAutomaticEntries({
      pendingInvoices: invoices,
      pendingPayments: payments,
      pendingReceivables: receivables,
      pendingTransactions: transactions
    });
  };

  const loadReconciledTransactions = () => {
    const transactions = JSON.parse(localStorage.getItem('bankTransactions') || '[]')
      .filter((transaction: BankTransaction) => 
        transaction.reconciliationStatus === 'conciliado'
      );
    setReconciledTransactions(transactions);
    setFilteredTransactions(transactions);
  };

  const loadSavedAutomaticEntries = () => {
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]')
      .filter((entry: AccountingEntry) => entry.entryType === 'automatic');
    setSavedAutomaticEntries(entries);
  };

  // Filter reconciled transactions based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTransactions(reconciledTransactions);
    } else {
      const filtered = reconciledTransactions.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, reconciledTransactions]);

  const createEntryBase = (entryType: 'debit' | 'credit' | 'complete') => {
    const baseEntry = {
      id: `${entryType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      schoolId: user?.schoolId || '',
      date: new Date(formData.date),
      entryType: 'manual' as const,
      auditTrail: [{
        id: Date.now().toString(),
        entryId: '',
        action: 'created' as const,
        userId: user?.id || '',
        userName: user?.name || '',
        timestamp: new Date(),
        reason: `Lançamento ${entryType === 'complete' ? 'completo' : entryType} criado manualmente`
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id || ''
    };

    baseEntry.auditTrail[0].entryId = baseEntry.id;
    return baseEntry;
  };

  const handleSaveManualEntry = () => {
    if (!formData.date || !formData.totalValue || (!formData.debitHistory || !formData.creditHistory) || !formData.debitAccount || !formData.creditAccount) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios incluindo os históricos de débito e crédito.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAccountFormat(formData.debitAccount) || !validateAccountCode(formData.debitAccount)) {
      toast({
        title: "Conta de débito inválida",
        description: "O código da conta de débito deve seguir o formato 0.0.00.00.0000 com valores válidos.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAccountFormat(formData.creditAccount) || !validateAccountCode(formData.creditAccount)) {
      toast({
        title: "Conta de crédito inválida", 
        description: "O código da conta de crédito deve seguir o formato 0.0.00.00.0000 com valores válidos.",
        variant: "destructive",
      });
      return;
    }

    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const newEntry: AccountingEntry = {
      ...createEntryBase('complete'),
      debitAccount: formData.debitAccount,
      debitValue: parseFloat(formData.debitValue.replace(/\D/g, '')) / 100 || 0,
      debitDescription: formData.debitDescription,
      debitHistory: formData.debitHistory,
      creditAccount: formData.creditAccount,
      creditValue: parseFloat(formData.creditValue.replace(/\D/g, '')) / 100 || 0,
      creditDescription: formData.creditDescription,
      creditHistory: formData.creditHistory,
      history: `D: ${formData.debitHistory} | C: ${formData.creditHistory}`,
      totalValue: parseFloat(formData.totalValue.replace(/\D/g, '')) / 100,
    };

    entries.push(newEntry);
    localStorage.setItem('accountingEntries', JSON.stringify(entries));

    toast({
      title: "Lançamento completo salvo",
      description: "O lançamento completo foi registrado com sucesso.",
    });

    // Reset all form fields
    setFormData({
      date: new Date().toISOString().split('T')[0],
      debitAccount: "",
      debitValue: "",
      debitDescription: "",
      debitHistory: "",
      creditAccount: "",
      creditValue: "",
      creditDescription: "",
      creditHistory: "",
      totalValue: "",
      entryType: "manual"
    });
  };

  const saveTransactionAsEntry = (transaction: BankTransaction) => {
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    
    const newEntry: AccountingEntry = {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      schoolId: user?.schoolId || '',
      date: new Date(transaction.date),
      entryType: 'automatic' as const,
      debitAccount: transaction.transactionType === 'debito' ? '1.1.01.01.0001' : '1.1.01.01.0001',
      debitValue: transaction.transactionType === 'debito' ? 0 : transaction.value,
      debitDescription: 'Banco',
      debitHistory: `Transação bancária: ${transaction.description}`,
      creditAccount: transaction.transactionType === 'credito' ? '4.1.01.01.0001' : '3.1.01.01.0001',
      creditValue: transaction.transactionType === 'credito' ? 0 : transaction.value,
      creditDescription: transaction.transactionType === 'credito' ? 'Receita' : 'Despesa',
      creditHistory: `Transação bancária: ${transaction.description}`,
      history: `Lançamento automático da transação: ${transaction.description}`,
      totalValue: transaction.value,
      auditTrail: [{
        id: Date.now().toString(),
        entryId: '',
        action: 'created' as const,
        userId: user?.id || '',
        userName: user?.name || '',
        timestamp: new Date(),
        reason: 'Lançamento automático gerado a partir de transação bancária conciliada'
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id || ''
    };

    newEntry.auditTrail[0].entryId = newEntry.id;
    entries.push(newEntry);
    localStorage.setItem('accountingEntries', JSON.stringify(entries));
    
    loadSavedAutomaticEntries();

    toast({
      title: "Transação salva",
      description: "A transação foi salva como lançamento automático.",
    });
  };

  const deleteAutomaticEntry = (entryId: string) => {
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const updatedEntries = entries.filter((entry: AccountingEntry) => entry.id !== entryId);
    localStorage.setItem('accountingEntries', JSON.stringify(updatedEntries));
    
    loadSavedAutomaticEntries();

    toast({
      title: "Lançamento excluído",
      description: "O lançamento automático foi removido com sucesso.",
    });
  };

  const generateAutomaticEntries = (type: 'all' | 'invoices' | 'payments' | 'receivables' | 'transactions') => {
    const entriesToGenerate: AccountingEntry[] = [];

    if (type === 'all' || type === 'invoices') {
      automaticEntries.pendingInvoices.forEach(invoice => {
        const entry = accountingAutomationService.generateInvoiceEntry(invoice, user?.id || '');
        entriesToGenerate.push(entry);
      });
    }

    if (type === 'all' || type === 'payments') {
      automaticEntries.pendingPayments.forEach(payment => {
        const entry = accountingAutomationService.generatePaymentEntry(payment, user?.id || '');
        entriesToGenerate.push(entry);
      });
    }

    if (type === 'all' || type === 'receivables') {
      automaticEntries.pendingReceivables.forEach(receivable => {
        const entry = accountingAutomationService.generateReceivableEntry(receivable, user?.id || '');
        entriesToGenerate.push(entry);
      });
    }

    if (type === 'all' || type === 'transactions') {
      automaticEntries.pendingTransactions.forEach(transaction => {
        const entry = accountingAutomationService.generateBankTransactionEntry(transaction, user?.id || '');
        entriesToGenerate.push(entry);
      });
    }

    if (entriesToGenerate.length > 0) {
      accountingAutomationService.processAutomaticEntries(entriesToGenerate);
      
      toast({
        title: "Lançamentos automáticos gerados",
        description: `${entriesToGenerate.length} lançamentos foram criados automaticamente.`,
      });

      loadPendingItems();
      loadSavedAutomaticEntries();
    } else {
      toast({
        title: "Nenhum lançamento pendente",
        description: "Não há itens pendentes para gerar lançamentos automáticos.",
      });
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const formatted = (Number(numericValue) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return formatted;
  };

  const handleCurrencyChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, [field]: inputValue }));
  };

  const handleAccountChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccountMask(e.target.value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const getAccountDescription = (accountCode: string) => {
    const accounts = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');
    const account = accounts.find((acc: any) => acc.code === accountCode);
    return account ? account.description : "";
  };

  useEffect(() => {
    if (formData.debitAccount) {
      const description = getAccountDescription(formData.debitAccount);
      if (description && description !== formData.debitDescription) {
        setFormData(prev => ({ ...prev, debitDescription: description }));
      }
    }
  }, [formData.debitAccount]);

  useEffect(() => {
    if (formData.creditAccount) {
      const description = getAccountDescription(formData.creditAccount);
      if (description && description !== formData.creditDescription) {
        setFormData(prev => ({ ...prev, creditDescription: description }));
      }
    }
  }, [formData.creditAccount]);

  return (
    <div className="space-y-6">
      {/* Configurações de Automação */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Sistema Integrado de Lançamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Geração Automática de Lançamentos</h3>
              <p className="text-sm text-gray-600">
                Ativar a geração automática de lançamentos contábeis a partir de outros módulos
              </p>
            </div>
            <Switch
              checked={autoGenerateEnabled}
              onCheckedChange={setAutoGenerateEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Itens Pendentes */}
      {autoGenerateEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notas Fiscais</p>
                  <p className="text-2xl font-bold text-blue-600">{automaticEntries.pendingInvoices.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pagamentos</p>
                  <p className="text-2xl font-bold text-red-600">{automaticEntries.pendingPayments.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recebimentos</p>
                  <p className="text-2xl font-bold text-green-600">{automaticEntries.pendingReceivables.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transações</p>
                  <p className="text-2xl font-bold text-purple-600">{automaticEntries.pendingTransactions.length}</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Abas de Lançamentos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Lançamento Manual</TabsTrigger>
          <TabsTrigger value="automatic">Lançamentos Automáticos</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl text-gray-800">Novo Lançamento Manual</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Data do Lançamento *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="h-12 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalValue" className="text-sm font-medium text-gray-700">
                    Valor Total *
                  </Label>
                  <Input
                    id="totalValue"
                    placeholder="R$ 0,00"
                    value={formData.totalValue ? formatCurrency(formData.totalValue) : ""}
                    onChange={handleCurrencyChange('totalValue')}
                    className="h-12 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-6 bg-red-50 rounded-xl border border-red-200">
                  <h3 className="font-semibold text-red-800 text-lg">Débito</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Conta Contábil *</Label>
                      <Input
                        placeholder="0.0.00.00.0000"
                        value={formData.debitAccount}
                        onChange={handleAccountChange('debitAccount')}
                        className="h-10 mt-1 rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                        maxLength={12}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formato: 0.0.00.00.0000 (1-9.1-9.01-99.01-99.0001-9999)
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Valor Débito</Label>
                      <Input
                        placeholder="R$ 0,00"
                        value={formData.debitValue ? formatCurrency(formData.debitValue) : ""}
                        onChange={handleCurrencyChange('debitValue')}
                        className="h-10 mt-1 rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Descrição da Conta</Label>
                      <Input
                        placeholder="Descrição será preenchida automaticamente"
                        value={formData.debitDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, debitDescription: e.target.value }))}
                        className="h-10 mt-1 rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Histórico do Débito *</Label>
                      <Textarea
                        placeholder="Descreva o histórico específico para o lançamento a débito..."
                        value={formData.debitHistory}
                        onChange={(e) => setFormData(prev => ({ ...prev, debitHistory: e.target.value }))}
                        className="min-h-[80px] resize-none rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-800 text-lg">Crédito</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Conta Contábil *</Label>
                      <Input
                        placeholder="0.0.00.00.0000"
                        value={formData.creditAccount}
                        onChange={handleAccountChange('creditAccount')}
                        className="h-10 mt-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                        maxLength={12}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formato: 0.0.00.00.0000 (1-9.1-9.01-99.01-99.0001-9999)
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Valor Crédito</Label>
                      <Input
                        placeholder="R$ 0,00"
                        value={formData.creditValue ? formatCurrency(formData.creditValue) : ""}
                        onChange={handleCurrencyChange('creditValue')}
                        className="h-10 mt-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Descrição da Conta</Label>
                      <Input
                        placeholder="Descrição será preenchida automaticamente"
                        value={formData.creditDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, creditDescription: e.target.value }))}
                        className="h-10 mt-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Histórico do Crédito *</Label>
                      <Textarea
                        placeholder="Descreva o histórico específico para o lançamento a crédito..."
                        value={formData.creditHistory}
                        onChange={(e) => setFormData(prev => ({ ...prev, creditHistory: e.target.value }))}
                        className="min-h-[80px] resize-none rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Salvamento */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-center">
                  <Button
                    onClick={handleSaveManualEntry}
                    className="h-12 px-8 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                    style={{ backgroundColor: '#041c43' }}
                  >
                    <Save className="mr-2 h-5 w-5" />
                    Salvar Lançamento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automatic" className="mt-6">
          <div className="space-y-6">
            {/* Busca de Transações Conciliadas */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-xl text-gray-800">Transações Conciliadas do Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-gray-700">Buscar Transações</Label>
                      <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Digite para buscar transações conciliadas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={transaction.description}>
                                {transaction.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.transactionType === 'credito' ? 'default' : 'secondary'}>
                                {transaction.transactionType === 'credito' ? 'Crédito' : 'Débito'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              <span className={transaction.transactionType === 'credito' ? 'text-green-600' : 'text-red-600'}>
                                {transaction.transactionType === 'debito' ? '-' : '+'}
                                {transaction.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => saveTransactionAsEntry(transaction)}
                              >
                                Salvar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Nenhuma transação encontrada com os filtros aplicados.' : 'Nenhuma transação conciliada encontrada.'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Lançamentos Automáticos Salvos */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="text-xl text-gray-800">Lançamentos Automáticos Salvos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {savedAutomaticEntries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Histórico</TableHead>
                        <TableHead>Conta Débito</TableHead>
                        <TableHead>Conta Crédito</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedAutomaticEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={entry.history}>
                              {entry.history}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{entry.debitAccount}</TableCell>
                          <TableCell className="font-mono text-sm">{entry.creditAccount}</TableCell>
                          <TableCell className="text-right font-semibold">
                            <Badge variant="outline" className="bg-green-50 text-green-800">
                              {entry.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAutomaticEntry(entry.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum lançamento automático salvo ainda.
                  </div>
                )}
              </CardContent>
            </Card>

            {autoGenerateEnabled && (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="text-xl text-gray-800">Processar Pendências dos Módulos</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Button
                      onClick={() => generateAutomaticEntries('all')}
                      className="h-12 bg-blue-600 hover:bg-blue-700"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Gerar Todos
                    </Button>

                    <Button
                      onClick={() => generateAutomaticEntries('invoices')}
                      variant="outline"
                      className="h-12"
                      disabled={automaticEntries.pendingInvoices.length === 0}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Notas Fiscais
                    </Button>

                    <Button
                      onClick={() => generateAutomaticEntries('payments')}
                      variant="outline"
                      className="h-12"
                      disabled={automaticEntries.pendingPayments.length === 0}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Pagamentos
                    </Button>

                    <Button
                      onClick={() => generateAutomaticEntries('receivables')}
                      variant="outline"
                      className="h-12"
                      disabled={automaticEntries.pendingReceivables.length === 0}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Recebimentos
                    </Button>

                    <Button
                      onClick={() => generateAutomaticEntries('transactions')}
                      variant="outline"
                      className="h-12"
                      disabled={automaticEntries.pendingTransactions.length === 0}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Transações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!autoGenerateEnabled && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Geração Automática Desabilitada
                  </h3>
                  <p className="text-gray-600">
                    Ative a geração automática de lançamentos para utilizar esta funcionalidade.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
