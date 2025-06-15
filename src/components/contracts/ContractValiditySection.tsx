import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, Edit } from "lucide-react";
import { ContractData } from "@/lib/types";
import { EditValidityDialog } from "./EditValidityDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContractValiditySectionProps {
  contracts: ContractData[];
  onUpdateContract: (contract: ContractData) => void;
}

interface SimplifiedContract {
  id: string;
  fornecedor: string;
  numeroContrato: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  originalContract: ContractData;
}

export function ContractValiditySection({ contracts, onUpdateContract }: ContractValiditySectionProps) {
  const [editingContract, setEditingContract] = useState<ContractData | null>(null);

  // Simplificar contratos e ordenar por data de término
  const simplifiedContracts = useMemo(() => {
    const simplified = contracts.map(contract => ({
      id: contract.id,
      fornecedor: contract.fornecedor.razaoSocial,
      numeroContrato: contract.numeroContrato,
      dataInicio: contract.dataInicio,
      dataFim: contract.dataFim,
      status: contract.status,
      originalContract: contract
    }));

    // Ordenar por data de término em ordem crescente
    return simplified.sort((a, b) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime());
  }, [contracts]);

  const calculateValidityProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    
    return progress;
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 30) {
      return "bg-green-500";
    } else if (progress <= 70) {
      return "bg-blue-500";
    } else {
      return "bg-red-500";
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

  const handleEditValidity = (contract: any) => {
    setEditingContract(contract.originalContract);
  };

  const handleUpdateValidity = (updatedContract: ContractData) => {
    onUpdateContract(updatedContract);
    setEditingContract(null);
  };

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Controle de Vigência dos Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhum contrato importado ainda.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Controle de Vigência dos Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Número do Processo</TableHead>
                  <TableHead>Data de Início da Vigência</TableHead>
                  <TableHead>Data de Término da Vigência</TableHead>
                  <TableHead>Status da Vigência</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simplifiedContracts.map((contract) => {
                  const progress = calculateValidityProgress(new Date(contract.dataInicio), new Date(contract.dataFim));
                  const progressColor = getProgressColor(progress);
                  const statusText = getStatusText(progress);

                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.fornecedor}</TableCell>
                      <TableCell className="font-medium">{contract.numeroContrato}</TableCell>
                      <TableCell>{formatDate(new Date(contract.dataInicio))}</TableCell>
                      <TableCell>{formatDate(new Date(contract.dataFim))}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[120px]">
                          <div className="flex justify-between text-sm">
                            <span>Vigência</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={progress} className="h-2" />
                            <div 
                              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${progressColor}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditValidity(contract)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Vigência
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingContract && (
        <EditValidityDialog
          contract={editingContract}
          onUpdate={handleUpdateValidity}
          onClose={() => setEditingContract(null)}
        />
      )}
    </>
  );
}
