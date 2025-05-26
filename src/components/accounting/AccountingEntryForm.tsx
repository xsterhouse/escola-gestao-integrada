
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export function AccountingEntryForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    debitAccount: "",
    debitValue: "",
    debitDescription: "",
    creditAccount: "",
    creditValue: "",
    creditDescription: "",
    history: "",
    totalValue: ""
  });
  const { toast } = useToast();

  // Função para buscar descrição da conta automaticamente
  const getAccountDescription = (accountCode: string) => {
    const accounts = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');
    const account = accounts.find((acc: any) => acc.code === accountCode);
    return account ? account.description : "";
  };

  // Effect para atualizar descrição do débito automaticamente
  useEffect(() => {
    if (formData.debitAccount) {
      const description = getAccountDescription(formData.debitAccount);
      if (description && description !== formData.debitDescription) {
        setFormData(prev => ({ ...prev, debitDescription: description }));
      }
    }
  }, [formData.debitAccount]);

  // Effect para atualizar descrição do crédito automaticamente
  useEffect(() => {
    if (formData.creditAccount) {
      const description = getAccountDescription(formData.creditAccount);
      if (description && description !== formData.creditDescription) {
        setFormData(prev => ({ ...prev, creditDescription: description }));
      }
    }
  }, [formData.creditAccount]);

  const handleSave = () => {
    if (!formData.date || !formData.totalValue || !formData.history || !formData.debitAccount || !formData.creditAccount) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Salvar lançamento contábil
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const newEntry = {
      id: Date.now().toString(),
      date: formData.date,
      debitAccount: formData.debitAccount,
      debitValue: parseFloat(formData.debitValue.replace(/\D/g, '')) / 100 || 0,
      debitDescription: formData.debitDescription,
      creditAccount: formData.creditAccount,
      creditValue: parseFloat(formData.creditValue.replace(/\D/g, '')) / 100 || 0,
      creditDescription: formData.creditDescription,
      history: formData.history,
      totalValue: parseFloat(formData.totalValue.replace(/\D/g, '')) / 100,
      createdAt: new Date().toISOString()
    };

    entries.push(newEntry);
    localStorage.setItem('accountingEntries', JSON.stringify(entries));

    toast({
      title: "Lançamento salvo",
      description: "O lançamento contábil foi registrado com sucesso.",
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      debitAccount: "",
      debitValue: "",
      debitDescription: "",
      creditAccount: "",
      creditValue: "",
      creditDescription: "",
      history: "",
      totalValue: ""
    });
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

  const formatAccountMask = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara: X.X.X.XX.XX
    let formatted = '';
    for (let i = 0; i < numbers.length && i < 8; i++) {
      if (i === 1 || i === 2 || i === 4 || i === 6) {
        formatted += '.';
      }
      formatted += numbers[i];
    }
    
    return formatted;
  };

  const handleAccountChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccountMask(e.target.value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  return (
    <Card className="shadow-lg border-0 rounded-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b rounded-t-xl">
        <CardTitle className="text-xl text-gray-800 font-semibold">Novo Lançamento Contábil</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data do Lançamento */}
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

          {/* Valor Total */}
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
          {/* Débito */}
          <div className="space-y-4 p-6 bg-red-50 rounded-xl border border-red-200">
            <h3 className="font-semibold text-red-800 text-lg">Débito</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Conta Contábil *</Label>
                <Input
                  placeholder="X.X.X.XX.XX"
                  value={formData.debitAccount}
                  onChange={handleAccountChange('debitAccount')}
                  className="h-10 mt-1 rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                  maxLength={11}
                />
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
            </div>
          </div>

          {/* Crédito */}
          <div className="space-y-4 p-6 bg-green-50 rounded-xl border border-green-200">
            <h3 className="font-semibold text-green-800 text-lg">Crédito</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Conta Contábil *</Label>
                <Input
                  placeholder="X.X.X.XX.XX"
                  value={formData.creditAccount}
                  onChange={handleAccountChange('creditAccount')}
                  className="h-10 mt-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                  maxLength={11}
                />
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
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div className="space-y-2">
          <Label htmlFor="history" className="text-sm font-medium text-gray-700">
            Histórico *
          </Label>
          <Textarea
            id="history"
            placeholder="Descreva o histórico do lançamento contábil..."
            value={formData.history}
            onChange={(e) => setFormData(prev => ({ ...prev, history: e.target.value }))}
            className="min-h-[100px] resize-none rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        {/* Botão Salvar */}
        <div className="pt-6 border-t border-gray-200">
          <Button
            onClick={handleSave}
            className="h-12 px-8 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
            style={{ backgroundColor: '#041c43' }}
          >
            <Save className="mr-2 h-5 w-5" />
            Salvar Lançamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
