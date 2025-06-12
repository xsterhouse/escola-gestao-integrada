
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AccountingEntry } from "@/lib/types";
import { Save, Calculator } from "lucide-react";

export function IntegratedEntryForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    debitAccount: "",
    creditAccount: "",
    value: 0,
    history: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.debitAccount || !formData.creditAccount || formData.value <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newEntry: AccountingEntry = {
      id: Date.now().toString(),
      date: formData.date,
      description: formData.description,
      debitAccount: formData.debitAccount,
      debitValue: formData.value,
      debitDescription: formData.description,
      creditAccount: formData.creditAccount,
      creditValue: formData.value,
      creditDescription: formData.description,
      history: formData.history,
      totalValue: formData.value,
      debitHistory: formData.history,
      creditHistory: formData.history,
      entryType: 'manual',
      reconciled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const existingEntries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    existingEntries.push(newEntry);
    localStorage.setItem('accountingEntries', JSON.stringify(existingEntries));

    toast({
      title: "Sucesso",
      description: "Lançamento contábil criado com sucesso!",
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      debitAccount: "",
      creditAccount: "",
      value: 0,
      history: ""
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Lançamento Contábil Integrado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do lançamento"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debitAccount">Conta de Débito</Label>
              <Select value={formData.debitAccount} onValueChange={(value) => setFormData(prev => ({ ...prev, debitAccount: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta de débito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.1.1.01">Caixa</SelectItem>
                  <SelectItem value="1.1.2.01">Bancos</SelectItem>
                  <SelectItem value="1.2.1.01">Estoque</SelectItem>
                  <SelectItem value="2.1.1.01">Fornecedores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditAccount">Conta de Crédito</Label>
              <Select value={formData.creditAccount} onValueChange={(value) => setFormData(prev => ({ ...prev, creditAccount: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta de crédito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.1.1.01">Caixa</SelectItem>
                  <SelectItem value="1.1.2.01">Bancos</SelectItem>
                  <SelectItem value="1.2.1.01">Estoque</SelectItem>
                  <SelectItem value="2.1.1.01">Fornecedores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="history">Histórico</Label>
            <Textarea
              id="history"
              value={formData.history}
              onChange={(e) => setFormData(prev => ({ ...prev, history: e.target.value }))}
              placeholder="Histórico detalhado do lançamento"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Salvar Lançamento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
