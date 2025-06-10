
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Save, Zap, FileText, DollarSign, Building, Search, Trash2, CheckCircle, ArrowRight, Lightbulb } from "lucide-react";
import { AccountingEntry, Invoice, PaymentAccount, ReceivableAccount, BankTransaction } from "@/lib/types";
import { accountingAutomationService } from "@/services/accountingAutomationService";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountValidation } from "@/hooks/useAccountValidation";
import { useAccountingNavigation } from "@/hooks/useAccountingNavigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestion?: string;
}

export function IntegratedEntryForm() {
  const { navigateToTab, guidedFlow, startGuidedFlow, completeStep, getCurrentStepInfo } = useAccountingNavigation();
  const { formatAndValidate, suggestAccounts } = useAccountValidation();
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
  
  const [validationState, setValidationState] = useState<{
    debitAccount: ValidationResult;
    creditAccount: ValidationResult;
  }>({
    debitAccount: { isValid: false, message: '', suggestion: '' },
    creditAccount: { isValid: false, message: '', suggestion: '' }
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
  const [showAccountSuggestions, setShowAccountSuggestions] = useState({ debit: false, credit: false });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadPendingItems();
    loadReconciledTransactions();
    loadSavedAutomaticEntries();
  }, []);

  // Validação em tempo real das contas
  useEffect(() => {
    if (formData.debitAccount) {
      const result = formatAndValidate(formData.debitAccount);
      setValidationState(prev => ({ 
        ...prev, 
        debitAccount: {
          isValid: result.validation.isValid,
          message: result.validation.message,
          suggestion: result.validation.suggestion || ''
        }
      }));
      if (result.description && result.description !== formData.debitDescription) {
        setFormData(prev => ({ ...prev, debitDescription: result.description }));
      }
      if (result.validation.isValid) {
        completeStep('debit');
      }
    }
  }, [formData.debitAccount, formatAndValidate, completeStep]);

  useEffect(() => {
    if (formData.creditAccount) {
      const result = formatAndValidate(formData.creditAccount);
      setValidationState(prev => ({ 
        ...prev, 
        creditAccount: {
          isValid: result.validation.isValid,
          message: result.validation.message,
          suggestion: result.validation.suggestion || ''
        }
      }));
      if (result.description && result.description !== formData.creditDescription) {
        setFormData(prev => ({ ...prev, creditDescription: result.description }));
      }
      if (result.validation.isValid) {
        completeStep('credit');
      }
    }
  }, [formData.creditAccount, formatAndValidate, completeStep]);

  // Controle do fluxo guiado
  useEffect(() => {
    if (formData.date) completeStep('date');
    if (formData.totalValue) completeStep('value');
    if (formData.debitHistory && formData.creditHistory) completeStep('history');
  }, [formData.date, formData.totalValue, formData.debitHistory, formData.creditHistory, completeStep]);

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

    if (!validationState.debitAccount.isValid) {
      toast({
        title: "Conta de débito inválida",
        description: validationState.debitAccount.message,
        variant: "destructive",
      });
      return;
    }

    if (!validationState.creditAccount.isValid) {
      toast({
        title: "Conta de crédito inválida", 
        description: validationState.creditAccount.message,
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

    completeStep('save');

    toast({
      title: "Lançamento salvo com sucesso!",
      description: "O lançamento foi registrado e está disponível para consulta.",
    });

    // Reset form
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
    const result = formatAndValidate(e.target.value);
    setFormData(prev => ({ ...prev, [field]: result.formatted }));
  };

  const stepInfo = getCurrentStepInfo();

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
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lançamento Manual
          </TabsTrigger>
          <TabsTrigger value="automatic" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Lançamentos Automáticos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-800">Novo Lançamento Manual</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startGuidedFlow}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Guia Passo a Passo
                  </Button>
                </div>
              </div>
              
              {guidedFlow.showGuide && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      Progresso: {Math.round(stepInfo.progress)}%
                    </span>
                    <span className="text-xs text-blue-600">
                      Passo {guidedFlow.currentStep + 1} de {guidedFlow.steps.length}
                    </span>
                  </div>
                  <Progress value={stepInfo.progress} className="h-2 mb-3" />
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${stepInfo.current?.completed ? 'text-green-600' : 'text-blue-600'}`} />
                    <span className="text-sm text-blue-800">{stepInfo.current?.label}</span>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Data do Lançamento *
                    {formData.date && <CheckCircle className="h-4 w-4 text-green-600" />}
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
                  <Label htmlFor="totalValue" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Valor Total *
                    {formData.totalValue && <CheckCircle className="h-4 w-4 text-green-600" />}
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
                  <h3 className="font-semibold text-red-800 text-lg flex items-center gap-2">
                    Débito
                    {validationState.debitAccount.isValid && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Conta Contábil *</Label>
                      <div className="relative">
                        <Input
                          placeholder="0.0.00.00.0000"
                          value={formData.debitAccount}
                          onChange={handleAccountChange('debitAccount')}
                          className={`h-10 mt-1 rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                            formData.debitAccount && !validationState.debitAccount.isValid ? 'border-red-500' : ''
                          } ${validationState.debitAccount.isValid ? 'border-green-500' : ''}`}
                          maxLength={12}
                          onFocus={() => setShowAccountSuggestions(prev => ({ ...prev, debit: true }))}
                          onBlur={() => setTimeout(() => setShowAccountSuggestions(prev => ({ ...prev, debit: false })), 200)}
                        />
                        {validationState.debitAccount.isValid && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {formData.debitAccount && !validationState.debitAccount.isValid && (
                        <div className="mt-1 text-xs text-red-600">
                          {validationState.debitAccount.message}
                          {validationState.debitAccount.suggestion && (
                            <div className="text-gray-500 mt-1">
                              Dica: {validationState.debitAccount.suggestion}
                            </div>
                          )}
                        </div>
                      )}
                      {showAccountSuggestions.debit && formData.debitAccount && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {suggestAccounts(formData.debitAccount).map((account, index) => (
                            <div
                              key={index}
                              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, debitAccount: account.code }));
                                setShowAccountSuggestions(prev => ({ ...prev, debit: false }));
                              }}
                            >
                              <div className="font-medium">{account.code}</div>
                              <div className="text-gray-600">{account.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Formato: 0.0.00.00.0000 (1-9.1-9.01-99.01-99.0001-9999)
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Descrição da Conta</Label>
                      <Input
                        placeholder="Descrição será preenchida automaticamente"
                        value={formData.debitDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, debitDescription: e.target.value }))}
                        className="h-10 mt-1 rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                        readOnly={!!validationState.debitAccount.isValid}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        Histórico do Débito *
                        {formData.debitHistory && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </Label>
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
                  <h3 className="font-semibold text-green-800 text-lg flex items-center gap-2">
                    Crédito
                    {validationState.creditAccount.isValid && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Conta Contábil *</Label>
                      <div className="relative">
                        <Input
                          placeholder="0.0.00.00.0000"
                          value={formData.creditAccount}
                          onChange={handleAccountChange('creditAccount')}
                          className={`h-10 mt-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 ${
                            formData.creditAccount && !validationState.creditAccount.isValid ? 'border-red-500' : ''
                          } ${validationState.creditAccount.isValid ? 'border-green-500' : ''}`}
                          maxLength={12}
                          onFocus={() => setShowAccountSuggestions(prev => ({ ...prev, credit: true }))}
                          onBlur={() => setTimeout(() => setShowAccountSuggestions(prev => ({ ...prev, credit: false })), 200)}
                        />
                        {validationState.creditAccount.isValid && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {formData.creditAccount && !validationState.creditAccount.isValid && (
                        <div className="mt-1 text-xs text-red-600">
                          {validationState.creditAccount.message}
                          {validationState.creditAccount.suggestion && (
                            <div className="text-gray-500 mt-1">
                              Dica: {validationState.creditAccount.suggestion}
                            </div>
                          )}
                        </div>
                      )}
                      {showAccountSuggestions.credit && formData.creditAccount && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {suggestAccounts(formData.creditAccount).map((account, index) => (
                            <div
                              key={index}
                              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, creditAccount: account.code }));
                                setShowAccountSuggestions(prev => ({ ...prev, credit: false }));
                              }}
                            >
                              <div className="font-medium">{account.code}</div>
                              <div className="text-gray-600">{account.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Formato: 0.0.00.00.0000 (1-9.1-9.01-99.01-99.0001-9999)
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Descrição da Conta</Label>
                      <Input
                        placeholder="Descrição será preenchida automaticamente"
                        value={formData.creditDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, creditDescription: e.target.value }))}
                        className="h-10 mt-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                        readOnly={!!validationState.creditAccount.isValid}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        Histórico do Crédito *
                        {formData.creditHistory && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </Label>
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
                    disabled={!validationState.debitAccount.isValid || !validationState.creditAccount.isValid || !formData.debitHistory || !formData.creditHistory || !formData.date || !formData.totalValue}
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
                                className="hover:bg-blue-50 hover:border-blue-500"
                              >
                                <Save className="h-4 w-4 mr-2" />
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
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Nenhum lançamento automático salvo
                    </h3>
                    <p className="text-gray-600">
                      Use a busca acima para encontrar transações conciliadas e salvá-las como lançamentos automáticos.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

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
