
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileCheck, AlertTriangle } from "lucide-react";
import { ContractData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface XmlValidationSectionProps {
  contracts: ContractData[];
}

interface ValidationResult {
  produto: string;
  contratado: number;
  recebido: number;
  valorContratado: number;
  valorRecebido: number;
  status: 'ok' | 'divergencia' | 'nao_encontrado';
}

export function XmlValidationSection({ contracts }: XmlValidationSectionProps) {
  const { toast } = useToast();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const handleXmlUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo XML",
        variant: "destructive",
      });
      return;
    }

    // Simular validação do XML
    const mockValidation: ValidationResult[] = [
      {
        produto: "Arroz Tipo 1 - 5kg",
        contratado: 150,
        recebido: 150,
        valorContratado: 3825.00,
        valorRecebido: 3825.00,
        status: 'ok'
      },
      {
        produto: "Feijão Carioca - 1kg",
        contratado: 100,
        recebido: 95,
        valorContratado: 890.00,
        valorRecebido: 845.50,
        status: 'divergencia'
      }
    ];

    setValidationResults(mockValidation);
    
    toast({
      title: "Validação Concluída",
      description: "XML processado e validado com os contratos",
    });

    event.target.value = '';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case 'divergencia':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'nao_encontrado':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok':
        return 'Conforme';
      case 'divergencia':
        return 'Divergência';
      case 'nao_encontrado':
        return 'Não encontrado';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          3. Validação com Notas Fiscais (XML)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="xml-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload do XML da Nota Fiscal
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  Arquivo .xml da NFe para validação
                </span>
              </label>
              <input
                id="xml-upload"
                name="xml-upload"
                type="file"
                className="sr-only"
                accept=".xml"
                onChange={handleXmlUpload}
              />
            </div>
            <Button asChild className="mt-4">
              <label htmlFor="xml-upload" className="cursor-pointer">
                Selecionar XML
              </label>
            </Button>
          </div>
        </div>

        {validationResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Resultado da Validação</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd Contratada</TableHead>
                    <TableHead>Qtd Recebida</TableHead>
                    <TableHead>Valor Contratado</TableHead>
                    <TableHead>Valor Recebido</TableHead>
                    <TableHead>Diferença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResults.map((result, index) => (
                    <TableRow key={index} className={result.status === 'divergencia' ? 'bg-orange-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className={
                            result.status === 'ok' ? 'text-green-600' :
                            result.status === 'divergencia' ? 'text-orange-600' : 'text-red-600'
                          }>
                            {getStatusText(result.status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{result.produto}</TableCell>
                      <TableCell>{result.contratado}</TableCell>
                      <TableCell>{result.recebido}</TableCell>
                      <TableCell>{formatCurrency(result.valorContratado)}</TableCell>
                      <TableCell>{formatCurrency(result.valorRecebido)}</TableCell>
                      <TableCell className={result.contratado !== result.recebido ? 'text-orange-600 font-medium' : 'text-green-600'}>
                        {result.contratado - result.recebido}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
