
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, AlertTriangle } from "lucide-react";

interface ContractData {
  id: string;
  fornecedor: string;
  dataInicio: Date;
  dataFim: Date;
  valorTotal: number;
}

export function ContractValidityCounter() {
  const [contracts] = useState<ContractData[]>([
    {
      id: "1",
      fornecedor: "Fornecedor Exemplo Ltda",
      dataInicio: new Date("2024-01-01"),
      dataFim: new Date("2024-12-31"),
      valorTotal: 50000.00
    },
    {
      id: "2", 
      fornecedor: "Empresa ABC S.A.",
      dataInicio: new Date("2024-06-01"),
      dataFim: new Date("2024-11-30"),
      valorTotal: 25000.00
    }
  ]);

  const calculateValidityProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    
    return progress;
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 50) {
      return "bg-green-500"; // Verde no início
    } else if (progress <= 80) {
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
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Controle de Vigência dos Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {contracts.map((contract) => {
              const progress = calculateValidityProgress(contract.dataInicio, contract.dataFim);
              const progressColor = getProgressColor(progress);
              const statusText = getStatusText(progress);
              
              return (
                <div key={contract.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{contract.fornecedor}</h3>
                      <p className="text-gray-600">{formatCurrency(contract.valorTotal)}</p>
                    </div>
                    <div className="text-right">
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
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Início: {formatDate(contract.dataInicio)}</span>
                      <span>Fim: {formatDate(contract.dataFim)}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progresso da vigência</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={progress} className="h-3" />
                        <div 
                          className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
