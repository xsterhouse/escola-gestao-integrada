
import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import { ContractData, ContractImportData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ExcelImportSectionProps {
  onImport: (contractData: ContractData) => void;
}

export function ExcelImportSection({ onImport }: ExcelImportSectionProps) {
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive",
      });
      return;
    }

    // Simular processamento do arquivo Excel
    // Em um cenário real, você usaria uma biblioteca como xlsx para ler o arquivo
    const mockContractData: ContractData = {
      id: `contract-${Date.now()}`,
      numeroContrato: "002/2023",
      fornecedorId: "fornecedor-1",
      fornecedor: {
        id: "fornecedor-1",
        cnpj: "12.345.678/0001-90",
        razaoSocial: "PAULISTA INDÚSTRIA E COMÉRCIO DE ALIMENTOS LTDA",
        endereco: "Rua das Indústrias, 123 - São Paulo/SP",
        telefone: "(11) 1234-5678",
        email: "contato@paulista.com.br",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      dataInicio: new Date("2023-01-01"),
      dataFim: new Date("2023-12-31"),
      status: 'ativo',
      items: [
        {
          id: "item-1",
          contractId: `contract-${Date.now()}`,
          produto: "Arroz Tipo 1 - 5kg",
          quantidadeContratada: 1000,
          precoUnitario: 25.50,
          valorTotalContrato: 25500.00,
          quantidadePaga: 300,
          valorPago: 7650.00,
          saldoQuantidade: 700,
          saldoValor: 17850.00,
          notasFiscais: {
            "NF 127": 150,
            "NF 201": 150
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "item-2",
          contractId: `contract-${Date.now()}`,
          produto: "Feijão Carioca - 1kg",
          quantidadeContratada: 500,
          precoUnitario: 8.90,
          valorTotalContrato: 4450.00,
          quantidadePaga: 200,
          valorPago: 1780.00,
          saldoQuantidade: 300,
          saldoValor: 2670.00,
          notasFiscais: {
            "NF 127": 100,
            "NF 201": 100
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onImport(mockContractData);
    
    toast({
      title: "Sucesso",
      description: "Planilha importada com sucesso!",
    });

    // Limpar input
    event.target.value = '';
  }, [onImport, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          1. Importação de Planilha Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="excel-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Clique para fazer upload da planilha Excel
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  Formatos aceitos: .xlsx, .xls
                </span>
              </label>
              <input
                id="excel-upload"
                name="excel-upload"
                type="file"
                className="sr-only"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </div>
            <Button asChild className="mt-4">
              <label htmlFor="excel-upload" className="cursor-pointer">
                Selecionar Arquivo
              </label>
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Formato esperado da planilha:</strong></p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Número do Contrato</li>
            <li>Nome do Fornecedor</li>
            <li>Vigência do Contrato</li>
            <li>Lista de Produtos com quantidades e valores</li>
            <li>Notas fiscais pagas por produto</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
