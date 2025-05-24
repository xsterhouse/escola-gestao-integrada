
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, Edit } from "lucide-react";
import { ContractData } from "@/lib/types";

interface ContractValiditySectionProps {
  contracts: ContractData[];
}

export function ContractValiditySection({ contracts }: ContractValiditySectionProps) {
  const calculateValidityProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    
    return progress;
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 30) {
      return "bg-green-500"; // Verde no início
    } else if (progress <= 70) {
      return "bg-blue-500"; // Azul no meio
    } else {
      return "bg-red-500"; // Vermelho ao final
    }
  };

  const getStatusText = (progress: number) => {
    if (progress >= 100) {
      return "Vencido";
    } else if (progress >= 80) {
      return "Próximo ao vencimento";
    } else if (progress >= 50) {
      return "Em andamento";
    } else {
      return "Início da vigência";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          5. Controle Visual da Vigência dos Contratos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum contrato importado ainda.
            </div>
          ) : (
            contracts.map((contract) => {
              const progress = calculateValidityProgress(contract.dataInicio, contract.dataFim);
              const progressColor = getProgressColor(progress);
              const statusText = getStatusText(progress);
              const valorTotal = contract.items.reduce((sum, item) => sum + item.valorTotalContrato, 0);
              const saldoTotal = contract.items.reduce((sum, item) => sum + item.saldoValor, 0);
              
              return (
                <div key={contract.id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">
                        Contrato {contract.numeroContrato}
                      </h3>
                      <p className="text-gray-600">{contract.fornecedor.razaoSocial}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Valor Total: {formatCurrency(valorTotal)}</span>
                        <span>Saldo: {formatCurrency(saldoTotal)}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2">
                        {progress >= 80 && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        <span className={`text-sm font-medium ${
                          progress >= 100 ? 'text-red-600' : 
                          progress >= 80 ? 'text-orange-600' : 
                          progress >= 50 ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {statusText}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Vigência
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Início: {formatDate(contract.dataInicio)}</span>
                      <span>Fim: {formatDate(contract.dataFim)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso da vigência</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={progress} className="h-4" />
                        <div 
                          className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Resumo dos itens */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Resumo dos Itens:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total de Itens:</span>
                          <span className="ml-2 font-medium">{contract.items.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor Pago:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {formatCurrency(contract.items.reduce((sum, item) => sum + item.valorPago, 0))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">% Executado:</span>
                          <span className="ml-2 font-medium">
                            {((contract.items.reduce((sum, item) => sum + item.valorPago, 0) / valorTotal) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className={`ml-2 font-medium ${
                            contract.status === 'ativo' ? 'text-green-600' :
                            contract.status === 'vencido' ? 'text-red-600' :
                            contract.status === 'liquidado' ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
