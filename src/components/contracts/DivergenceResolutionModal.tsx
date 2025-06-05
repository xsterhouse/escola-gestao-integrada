
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContractData, ContractDivergence } from "@/lib/types";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DivergenceResolutionModalProps {
  divergences: ContractDivergence[];
  contractData: ContractData;
  ataId: string;
  onImportWithDivergences: () => void;
  onCancel: () => void;
}

export function DivergenceResolutionModal({
  divergences,
  contractData,
  ataId,
  onImportWithDivergences,
  onCancel
}: DivergenceResolutionModalProps) {
  
  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'descricao': return 'Descrição';
      case 'unidade': return 'Unidade';
      case 'quantidade': return 'Quantidade';
      case 'valorUnitario': return 'Valor Unitário';
      default: return field;
    }
  };

  const getSeverityColor = (field: string) => {
    switch (field) {
      case 'descricao': return 'bg-yellow-100 text-yellow-800';
      case 'quantidade': return 'bg-red-100 text-red-800';
      case 'valorUnitario': return 'bg-orange-100 text-orange-800';
      case 'unidade': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (field: string, value: string | number) => {
    if (field === 'valorUnitario' && typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toString();
  };

  const criticalDivergences = divergences.filter(d => 
    d.field === 'quantidade' || d.valorATA === 'Não encontrado na ATA'
  );

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Divergências Encontradas na Importação
          </DialogTitle>
          <DialogDescription>
            Foram encontradas {divergences.length} divergência(s) entre o contrato e a ATA {ataId}.
            {criticalDivergences.length > 0 && (
              <span className="text-red-600 font-medium">
                {" "}Atenção: {criticalDivergences.length} divergência(s) crítica(s) encontrada(s).
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Divergências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{divergences.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Divergências Críticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalDivergences.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Itens Afetados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(divergences.map(d => d.contractItemId)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Divergences Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campo</TableHead>
                  <TableHead>Valor no Contrato</TableHead>
                  <TableHead>Valor na ATA</TableHead>
                  <TableHead>Severidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divergences.map((divergence) => (
                  <TableRow key={divergence.id}>
                    <TableCell className="font-medium">
                      {getFieldLabel(divergence.field)}
                    </TableCell>
                    <TableCell>
                      {formatValue(divergence.field, divergence.valorContrato)}
                    </TableCell>
                    <TableCell>
                      {formatValue(divergence.field, divergence.valorATA)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(divergence.field)}>
                        {divergence.valorATA === 'Não encontrado na ATA' ? 'Crítica' : 
                         divergence.field === 'quantidade' ? 'Alta' : 
                         divergence.field === 'valorUnitario' ? 'Média' : 'Baixa'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">O que acontece se eu importar com divergências?</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  O contrato será importado com status "Divergência de Dados" e ficará pendente de correção.
                  Você poderá editar manualmente os itens divergentes na aba de acompanhamento e o sistema
                  fará uma nova validação automaticamente após as correções.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar Importação
          </Button>
          <Button 
            variant="destructive" 
            onClick={onImportWithDivergences}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Importar com Divergências
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
