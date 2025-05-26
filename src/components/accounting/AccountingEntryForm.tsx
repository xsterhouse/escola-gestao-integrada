
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export function AccountingEntryForm() {
  const [formData, setFormData] = useState({
    date: "",
    debitValue: "",
    debitDescription: "",
    creditValue: "",
    creditDescription: "",
    history: "",
    totalValue: ""
  });
  const { toast } = useToast();

  const handleSave = () => {
    if (!formData.date || !formData.totalValue || !formData.history) {
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
      debitValue: parseFloat(formData.debitValue.replace(/\D/g, '')) / 100,
      debitDescription: formData.debitDescription,
      creditValue: parseFloat(formData.creditValue.replace(/\D/g, '')) / 100,
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
      date: "",
      debitValue: "",
      debitDescription: "",
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

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <CardTitle className="text-xl text-gray-800">Novo Lançamento Contábil</CardTitle>
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
              className="h-12"
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
              className="h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Débito */}
          <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800">Débito</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">Valor Débito</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={formData.debitValue ? formatCurrency(formData.debitValue) : ""}
                  onChange={handleCurrencyChange('debitValue')}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Descrição da Conta</Label>
                <Input
                  placeholder="Ex: Despesas com Alimentação"
                  value={formData.debitDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, debitDescription: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Crédito */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800">Crédito</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">Valor Crédito</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={formData.creditValue ? formatCurrency(formData.creditValue) : ""}
                  onChange={handleCurrencyChange('creditValue')}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Descrição da Conta</Label>
                <Input
                  placeholder="Ex: Banco Conta Movimento"
                  value={formData.creditDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditDescription: e.target.value }))}
                  className="h-10"
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
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Botão Salvar */}
        <div className="pt-6 border-t">
          <Button
            onClick={handleSave}
            className="h-12 px-8 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
