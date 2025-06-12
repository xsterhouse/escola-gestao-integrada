import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Plus, 
  Calculator,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  CreditCard
} from "lucide-react";
import { AccountingEntry, PaymentAccount, ReceivableAccount, BankTransaction } from "@/lib/types";

interface IntegratedEntryFormProps {
  onSubmit: (entry: AccountingEntry) => void;
  existingEntry?: AccountingEntry;
  onCancel?: () => void;
}

export function IntegratedEntryForm({ onSubmit, existingEntry, onCancel }: IntegratedEntryFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: existingEntry?.date || new Date().toISOString().split('T')[0],
    debitAccount: existingEntry?.debitAccount || "",
    debitValue: existingEntry?.debitValue || 0,
    debitDescription: existingEntry?.debitDescription || "",
    creditAccount: existingEntry?.creditAccount || "",
    creditValue: existingEntry?.creditValue || 0,
    creditDescription: existingEntry?.creditDescription || "",
    history: existingEntry?.history || "",
    debitHistory: existingEntry?.debitHistory || "",
    creditHistory: existingEntry?.creditHistory || "",
    entryType: existingEntry?.entryType || 'manual' as const
  });

  const [accountingSuggestions] = useState([
    { code: "1.1.1.01", name: "Caixa" },
    { code: "1.1.1.02", name: "Bancos Conta Movimento" },
    { code: "1.1.1.03", name: "Bancos Conta Aplicação" },
    { code: "1.1.2.01", name: "Clientes" },
    { code: "1.1.3.01", name: "Estoques" },
    { code: "2.1.1.01", name: "Fornecedores" },
    { code: "2.1.2.01", name: "Obrigações Trabalhistas" },
    { code: "2.1.3.01", name: "Obrigações Tributárias" },
    { code: "3.1.1.01", name: "Capital Social" },
    { code: "4.1.1.01", name: "Receitas de Vendas" },
    { code: "5.1.1.01", name: "Custos dos Produtos Vendidos" },
    { code: "6.1.1.01", name: "Despesas Administrativas" },
    { code: "6.1.2.01", name: "Despesas Comerciais" },
    { code: "7.1.1.01", name: "Receitas Financeiras" },
    { code: "8.1.1.01", name: "Despesas Financeiras" }
  ]);

  const [bankAccounts] = useState([
    { id: "1", name: "Banco do Brasil - CC 12345-6", account: "1.1.1.02.001" },
    { id: "2", name: "Caixa Econômica - CC 67890-1", account: "1.1.1.02.002" },
    { id: "3", name: "Santander - Poupança 11111-1", account: "1.1.1.03.001" }
  ]);

  const [entryTemplates] = useState([
    {
      name: "Pagamento a Fornecedor",
      debitAccount: "2.1.1.01",
      creditAccount: "1.1.1.02",
      description: "Pagamento de fornecedor"
    },
    {
      name: "Recebimento de Cliente",
      debitAccount: "1.1.1.02",
      creditAccount: "1.1.2.01",
      description: "Recebimento de cliente"
    },
    {
      name: "Despesa Administrativa",
      debitAccount: "6.1.1.01",
      creditAccount: "1.1.1.02",
      description: "Despesa administrativa"
    }
  ]);

  const validateForm = () => {
    if (!formData.date || !formData.debitAccount || !formData.creditAccount || !formData.history) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.debitValue !== formData.creditValue) {
      toast({
        title: "Erro de validação",
        description: "O valor do débito deve ser igual ao valor do crédito.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.debitValue <= 0) {
      toast({
        title: "Erro de validação",
        description: "O valor deve ser maior que zero.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const entry: AccountingEntry = {
      id: existingEntry?.id || `entry-${Date.now()}`,
      date: formData.date,
      debitAccount: formData.debitAccount,
      debitValue: formData.debitValue,
      debitDescription: formData.debitDescription,
      creditAccount: formData.creditAccount,
      creditValue: formData.creditValue,
      creditDescription: formData.creditDescription,
      history: formData.history,
      totalValue: formData.debitValue,
      entryType: formData.entryType,
      debitHistory: formData.debitHistory,
      creditHistory: formData.creditHistory,
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(entry);
    
    if (!existingEntry) {
      // Reset form for new entries
      setFormData({
        date: new Date().toISOString().split('T')[0],
        debitAccount: "",
        debitValue: 0,
        debitDescription: "",
        creditAccount: "",
        creditValue: 0,
        creditDescription: "",
        history: "",
        debitHistory: "",
        creditHistory: "",
        entryType: 'manual'
      });
    }

    toast({
      title: existingEntry ? "Lançamento atualizado" : "Lançamento criado",
      description: existingEntry ? "O lançamento foi atualizado com sucesso." : "O lançamento foi criado com sucesso.",
    });
  };

  const handleValueChange = (field: 'debitValue' | 'creditValue', value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      [field === 'debitValue' ? 'creditValue' : 'debitValue']: value
    }));
  };

  const applyTemplate = (template: typeof entryTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      debitAccount: template.debitAccount,
      creditAccount: template.creditAccount,
      debitDescription: template.description,
      creditDescription: template.description,
      history: template.description
    }));
  };

  const getAccountName = (code: string) => {
    const account = accountingSuggestions.find(acc => acc.code === code);
    return account ? `${account.code} - ${account.name}` : code;
  };

  const generatePaymentEntry = () => {
    const paymentAccounts: PaymentAccount[] = JSON.parse(localStorage.getItem('paymentAccounts') || '[]');
    const pendingPayments = paymentAccounts.filter(p => p.status === 'pendente');
    
    if (pendingPayments.length === 0) {
      toast({
        title: "Nenhuma conta a pagar pendente",
        description: "Não há contas a pagar pendentes para gerar lançamento.",
        variant: "destructive"
      });
      return;
    }

    // Take the first pending payment as example
    const payment = pendingPayments[0];
    
    setFormData(prev => ({
      ...prev,
      debitAccount: "2.1.1.01", // Fornecedores
      creditAccount: "1.1.1.02", // Bancos
      debitValue: payment.value,
      creditValue: payment.value,
      debitDescription: `Pagamento - ${payment.description}`,
      creditDescription: `Pagamento - ${payment.description}`,
      history: `Pagamento a ${payment.supplier} - ${payment.description}`,
      entryType: 'automatic'
    }));

    toast({
      title: "Lançamento gerado",
      description: "Lançamento automático gerado a partir da conta a pagar.",
    });
  };

  const generateReceivableEntry = () => {
    const receivableAccounts: ReceivableAccount[] = JSON.parse(localStorage.getItem('receivableAccounts') || '[]');
    const pendingReceivables = receivableAccounts.filter(r => r.status === 'pendente');
    
    if (pendingReceivables.length === 0) {
      toast({
        title: "Nenhuma conta a receber pendente",
        description: "Não há contas a receber pendentes para gerar lançamento.",
        variant: "destructive"
      });
      return;
    }

    // Take the first pending receivable as example
    const receivable = pendingReceivables[0];
    
    setFormData(prev => ({
      ...prev,
      debitAccount: "1.1.1.02", // Bancos
      creditAccount: "1.1.2.01", // Clientes
      debitValue: receivable.value,
      creditValue: receivable.value,
      debitDescription: `Recebimento - ${receivable.description}`,
      creditDescription: `Recebimento - ${receivable.description}`,
      history: `Recebimento de ${receivable.source} - ${receivable.description}`,
      entryType: 'automatic'
    }));

    toast({
      title: "Lançamento gerado",
      description: "Lançamento automático gerado a partir da conta a receber.",
    });
  };

  const generateBankTransactionEntry = () => {
    const bankTransactions: BankTransaction[] = JSON.parse(localStorage.getItem('bankTransactions') || '[]');
    const pendingTransactions = bankTransactions.filter(t => t.reconciliationStatus === 'pendente');
    
    if (pendingTransactions.length === 0) {
      toast({
        title: "Nenhuma transação bancária pendente",
        description: "Não há transações bancárias pendentes para gerar lançamento.",
        variant: "destructive"
      });
      return;
    }

    // Take the first pending transaction as example
    const transaction = pendingTransactions[0];
    
    const isCredit = transaction.transactionType === 'credito';
    
    setFormData(prev => ({
      ...prev,
      debitAccount: isCredit ? "1.1.1.02" : "6.1.1.01", // Bancos ou Despesas
      creditAccount: isCredit ? "4.1.1.01" : "1.1.1.02", // Receitas ou Bancos
      debitValue: transaction.value,
      creditValue: transaction.value,
      debitDescription: transaction.description,
      creditDescription: transaction.description,
      history: `Transação bancária - ${transaction.description}`,
      entryType: 'automatic'
    }));

    toast({
      title: "Lançamento gerado",
      description: "Lançamento automático gerado a partir da transação bancária.",
    });
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-6 w-6" />
          {existingEntry ? "Editar Lançamento Contábil" : "Novo Lançamento Contábil Integrado"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="manual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Lançamento Manual</TabsTrigger>
            <TabsTrigger value="automatic">Geração Automática</TabsTrigger>
            <TabsTrigger value="templates">Modelos</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">Data do Lançamento *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryType" className="text-sm font-medium">Tipo de Lançamento</Label>
                  <Select 
                    value={formData.entryType} 
                    onValueChange={(value: 'manual' | 'automatic') => 
                      setFormData({ ...formData, entryType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              
              <div className="space-y-4 p-4 border rounded-lg bg-red-50">
                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Débito
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debitAccount" className="text-sm font-medium">Conta de Débito *</Label>
                    <Select 
                      value={formData.debitAccount} 
                      onValueChange={(value) => setFormData({ ...formData, debitAccount: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta de débito" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountingSuggestions.map((account) => (
                          <SelectItem key={account.code} value={account.code}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="debitValue" className="text-sm font-medium">Valor do Débito *</Label>
                    <Input
                      id="debitValue"
                      type="number"
                      step="0.01"
                      value={formData.debitValue}
                      onChange={(e) => handleValueChange('debitValue', parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debitDescription" className="text-sm font-medium">Descrição do Débito</Label>
                  <Input
                    id="debitDescription"
                    value={formData.debitDescription}
                    onChange={(e) => setFormData({ ...formData, debitDescription: e.target.value })}
                    placeholder="Descrição específica do débito"
                  />
                </div>
              </div>

              
              <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crédito
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditAccount" className="text-sm font-medium">Conta de Crédito *</Label>
                    <Select 
                      value={formData.creditAccount} 
                      onValueChange={(value) => setFormData({ ...formData, creditAccount: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta de crédito" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountingSuggestions.map((account) => (
                          <SelectItem key={account.code} value={account.code}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creditValue" className="text-sm font-medium">Valor do Crédito *</Label>
                    <Input
                      id="creditValue"
                      type="number"
                      step="0.01"
                      value={formData.creditValue}
                      onChange={(e) => handleValueChange('creditValue', parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditDescription" className="text-sm font-medium">Descrição do Crédito</Label>
                  <Input
                    id="creditDescription"
                    value={formData.creditDescription}
                    onChange={(e) => setFormData({ ...formData, creditDescription: e.target.value })}
                    placeholder="Descrição específica do crédito"
                  />
                </div>
              </div>

              
              <div className="space-y-2">
                <Label htmlFor="history" className="text-sm font-medium">Histórico do Lançamento *</Label>
                <Textarea
                  id="history"
                  value={formData.history}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  placeholder="Descreva o histórico do lançamento contábil"
                  className="min-h-[80px]"
                  required
                />
              </div>

              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Verificação de Balanceamento:</span>
                  <Badge variant={formData.debitValue === formData.creditValue ? "default" : "destructive"}>
                    {formData.debitValue === formData.creditValue ? "Balanceado" : "Desbalanceado"}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div>Débito: R$ {formData.debitValue.toFixed(2)}</div>
                  <div>Crédito: R$ {formData.creditValue.toFixed(2)}</div>
                  <div>Diferença: R$ {Math.abs(formData.debitValue - formData.creditValue).toFixed(2)}</div>
                </div>
              </div>

              
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <Calculator className="mr-2 h-4 w-4" />
                  {existingEntry ? "Atualizar Lançamento" : "Criar Lançamento"}
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="automatic">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Geração Automática de Lançamentos</h3>
                <p className="text-gray-600 mb-6">
                  Gere lançamentos contábeis automaticamente a partir de outras operações do sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={generatePaymentEntry}>
                  <CardContent className="p-6 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-red-600" />
                    <h4 className="font-semibold mb-2">Contas a Pagar</h4>
                    <p className="text-sm text-gray-600">
                      Gerar lançamento a partir de uma conta a pagar pendente
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={generateReceivableEntry}>
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h4 className="font-semibold mb-2">Contas a Receber</h4>
                    <p className="text-sm text-gray-600">
                      Gerar lançamento a partir de uma conta a receber pendente
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={generateBankTransactionEntry}>
                  <CardContent className="p-6 text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <h4 className="font-semibold mb-2">Transações Bancárias</h4>
                    <p className="text-sm text-gray-600">
                      Gerar lançamento a partir de transações bancárias
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Modelos de Lançamento</h3>
                <p className="text-gray-600 mb-6">
                  Use modelos pré-configurados para acelerar a criação de lançamentos comuns.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entryTemplates.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{template.name}</h4>
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div>Débito: {getAccountName(template.debitAccount)}</div>
                        <div>Crédito: {getAccountName(template.creditAccount)}</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => applyTemplate(template)}
                      >
                        Aplicar Modelo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
