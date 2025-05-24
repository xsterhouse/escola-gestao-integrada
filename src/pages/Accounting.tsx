
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";

const Accounting = () => {
  const [date, setDate] = useState<Date>();
  const [debitAccount, setDebitAccount] = useState("");
  const [creditAccount, setCreditAccount] = useState("");
  const [history, setHistory] = useState("");
  const [value, setValue] = useState("");
  const { toast } = useToast();

  // Mock function to get account description
  const getAccountDescription = (accountCode: string) => {
    const accounts: { [key: string]: string } = {
      "1.1.1.1.0001": "Caixa",
      "1.1.2.1.0001": "Bancos Conta Movimento",
      "2.1.1.1.0001": "Fornecedores",
      "3.1.1.1.0001": "Receitas de Impostos",
      "4.1.1.1.0001": "Despesas com Pessoal",
    };
    return accounts[accountCode] || "";
  };

  const handleSave = () => {
    if (!date || !debitAccount || !creditAccount || !history || !value) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    // Here you would save the data
    toast({
      title: "Lançamento salvo",
      description: "O lançamento contábil foi salvo com sucesso.",
    });

    // Reset form
    setDate(undefined);
    setDebitAccount("");
    setCreditAccount("");
    setHistory("");
    setValue("");
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const formatted = (Number(numericValue) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return formatted;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    setValue(inputValue);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Módulo de Contabilidade</h1>
            <p className="text-gray-600 mt-1">Registre lançamentos contábeis do sistema</p>
          </div>
        </div>

        {/* Main Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl text-gray-800">Novo Lançamento Contábil</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Data do Lançamento
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Debit Account */}
            <div className="space-y-2">
              <Label htmlFor="debit" className="text-sm font-medium text-gray-700">
                Conta de Débito
              </Label>
              <Input
                id="debit"
                placeholder="0.0.0.0.0000"
                value={debitAccount}
                onChange={(e) => setDebitAccount(e.target.value)}
                className="h-12 text-lg"
                maxLength={11}
              />
              {debitAccount && (
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm text-gray-600">Descrição da conta:</p>
                  <p className="font-medium text-gray-800">
                    {getAccountDescription(debitAccount) || "Conta não encontrada"}
                  </p>
                </div>
              )}
            </div>

            {/* Credit Account */}
            <div className="space-y-2">
              <Label htmlFor="credit" className="text-sm font-medium text-gray-700">
                Conta de Crédito
              </Label>
              <Input
                id="credit"
                placeholder="0.0.0.0.0000"
                value={creditAccount}
                onChange={(e) => setCreditAccount(e.target.value)}
                className="h-12 text-lg"
                maxLength={11}
              />
              {creditAccount && (
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm text-gray-600">Descrição da conta:</p>
                  <p className="font-medium text-gray-800">
                    {getAccountDescription(creditAccount) || "Conta não encontrada"}
                  </p>
                </div>
              )}
            </div>

            {/* History */}
            <div className="space-y-2">
              <Label htmlFor="history" className="text-sm font-medium text-gray-700">
                Histórico
              </Label>
              <Textarea
                id="history"
                placeholder="Descreva o histórico do lançamento contábil..."
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm font-medium text-gray-700">
                Valor (R$)
              </Label>
              <div className="relative">
                <Input
                  id="value"
                  placeholder="R$ 0,00"
                  value={value ? formatCurrency(value) : ""}
                  onChange={handleValueChange}
                  className="h-12 text-lg pl-12"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  R$
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t">
              <Button
                onClick={handleSave}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Salvar Lançamento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Informações Importantes</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Todos os campos são obrigatórios para o lançamento</li>
                  <li>• As contas devem seguir o formato padrão: 0.0.0.0.0000</li>
                  <li>• O histórico deve ser claro e descritivo</li>
                  <li>• Valores devem ser inseridos em reais (R$)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Accounting;
