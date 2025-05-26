
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function CloseExerciseTab() {
  const [exerciseYear, setExerciseYear] = useState(new Date().getFullYear().toString());
  const [isClosing, setIsClosing] = useState(false);
  const [exerciseResult, setExerciseResult] = useState<{
    totalRevenues: number;
    totalExpenses: number;
    result: number;
    type: 'superavit' | 'deficit';
  } | null>(null);
  
  const { toast } = useToast();

  const calculateExerciseResult = () => {
    // Buscar lançamentos do exercício
    const entries = JSON.parse(localStorage.getItem('accountingEntries') || '[]');
    const exerciseEntries = entries.filter((entry: any) => {
      const entryYear = new Date(entry.date).getFullYear();
      return entryYear === parseInt(exerciseYear);
    });

    // Calcular receitas e despesas
    let totalRevenues = 0;
    let totalExpenses = 0;

    exerciseEntries.forEach((entry: any) => {
      // Simplificação: considerar lançamentos que contenham palavras-chave
      if (entry.debitDescription.toLowerCase().includes('receita') || 
          entry.creditDescription.toLowerCase().includes('receita')) {
        totalRevenues += entry.totalValue;
      }
      if (entry.debitDescription.toLowerCase().includes('despesa') || 
          entry.creditDescription.toLowerCase().includes('despesa')) {
        totalExpenses += entry.totalValue;
      }
    });

    const result = totalRevenues - totalExpenses;
    return {
      totalRevenues,
      totalExpenses,
      result: Math.abs(result),
      type: result >= 0 ? 'superavit' : 'deficit'
    };
  };

  const closeExercise = async () => {
    if (!exerciseYear) {
      toast({
        title: "Ano obrigatório",
        description: "Selecione o ano do exercício para encerrar.",
        variant: "destructive",
      });
      return;
    }

    setIsClosing(true);

    try {
      // Calcular resultado do exercício
      const result = calculateExerciseResult();
      setExerciseResult(result);

      // Simular processo de encerramento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Salvar resultado do encerramento
      const closedExercises = JSON.parse(localStorage.getItem('closedExercises') || '[]');
      const newClosure = {
        year: exerciseYear,
        closureDate: new Date().toISOString(),
        totalRevenues: result.totalRevenues,
        totalExpenses: result.totalExpenses,
        result: result.result,
        type: result.type
      };

      closedExercises.push(newClosure);
      localStorage.setItem('closedExercises', JSON.stringify(closedExercises));

      toast({
        title: "Exercício encerrado",
        description: `O exercício ${exerciseYear} foi encerrado com ${result.type === 'superavit' ? 'superávit' : 'déficit'} de ${result.result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
      });

    } catch (error) {
      toast({
        title: "Erro no encerramento",
        description: "Não foi possível encerrar o exercício. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800">Encerramento do Exercício</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              O encerramento do exercício é um processo irreversível que apura o resultado do período 
              e zera as contas de resultado (receitas e despesas). Certifique-se de que todos os 
              lançamentos do período foram registrados corretamente.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Ano do Exercício</Label>
                <Input
                  type="number"
                  min="2020"
                  max="2030"
                  value={exerciseYear}
                  onChange={(e) => setExerciseYear(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button
                onClick={closeExercise}
                disabled={isClosing}
                className="h-12 px-8 text-white font-semibold w-full"
                style={{ backgroundColor: '#041c43' }}
              >
                {isClosing ? (
                  "Encerrando Exercício..."
                ) : (
                  "Encerrar Exercício"
                )}
              </Button>
            </div>

            {exerciseResult && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Resultado do Exercício {exerciseYear}</h3>
                
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de Receitas:</span>
                    <span className="font-semibold text-green-600">
                      {exerciseResult.totalRevenues.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de Despesas:</span>
                    <span className="font-semibold text-red-600">
                      {exerciseResult.totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  
                  <hr className="border-gray-300" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">
                      {exerciseResult.type === 'superavit' ? 'Superávit:' : 'Déficit:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${exerciseResult.type === 'superavit' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`font-bold text-lg ${exerciseResult.type === 'superavit' ? 'text-green-600' : 'text-red-600'}`}>
                        {exerciseResult.result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Encerramentos */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Histórico de Encerramentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {JSON.parse(localStorage.getItem('closedExercises') || '[]').map((closure: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Exercício {closure.year}</h4>
                    <p className="text-sm text-gray-600">
                      Encerrado em {new Date(closure.closureDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${closure.type === 'superavit' ? 'text-green-600' : 'text-red-600'}`}>
                      {closure.type === 'superavit' ? 'Superávit' : 'Déficit'}
                    </p>
                    <p className="text-lg font-bold">
                      {closure.result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {JSON.parse(localStorage.getItem('closedExercises') || '[]').length === 0 && (
              <p className="text-center py-8 text-gray-500">
                Nenhum exercício foi encerrado ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
