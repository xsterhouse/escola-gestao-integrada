
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContractData, Supplier } from "@/lib/types";
import * as XLSX from "xlsx";
import { getCurrentISOString } from "@/lib/date-utils";

interface ExcelImportSectionProps {
  onImport: (contracts: ContractData[]) => void;
}

export function ExcelImportSection({ onImport }: ExcelImportSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setProcessed(false);
        setValidationResult(null);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls).",
          variant: "destructive"
        });
      }
    }
  };

  const validateExcelData = (data: any[]): { valid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (data.length === 0) {
      errors.push("O arquivo está vazio ou não contém dados válidos");
      return { valid: false, errors, warnings };
    }

    // Check required columns
    const firstRow = data[0];
    const requiredColumns = ['CONTRATO', 'FORNECEDOR', 'PRODUTO', 'QUANTIDADE', 'VALOR_UNITARIO'];
    
    for (const col of requiredColumns) {
      if (!(col in firstRow)) {
        errors.push(`Coluna obrigatória '${col}' não encontrada`);
      }
    }

    // Validate data types and ranges
    data.forEach((row, index) => {
      const rowNum = index + 2; // Excel row number (starting from 2)
      
      if (!row.CONTRATO || typeof row.CONTRATO !== 'string') {
        errors.push(`Linha ${rowNum}: Número do contrato inválido`);
      }
      
      if (!row.FORNECEDOR || typeof row.FORNECEDOR !== 'string') {
        errors.push(`Linha ${rowNum}: Nome do fornecedor inválido`);
      }
      
      if (!row.PRODUTO || typeof row.PRODUTO !== 'string') {
        errors.push(`Linha ${rowNum}: Descrição do produto inválida`);
      }
      
      if (!row.QUANTIDADE || isNaN(Number(row.QUANTIDADE)) || Number(row.QUANTIDADE) <= 0) {
        errors.push(`Linha ${rowNum}: Quantidade deve ser um número positivo`);
      }
      
      if (!row.VALOR_UNITARIO || isNaN(Number(row.VALOR_UNITARIO)) || Number(row.VALOR_UNITARIO) <= 0) {
        errors.push(`Linha ${rowNum}: Valor unitário deve ser um número positivo`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  };

  const processExcelFile = async () => {
    if (!file) return;

    setProcessing(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Validate data
      const validation = validateExcelData(data);
      setValidationResult(validation);

      if (!validation.valid) {
        setProcessing(false);
        return;
      }

      // Process data into contracts
      const contractsMap = new Map<string, any>();
      
      data.forEach((row: any) => {
        const contractNumber = row.CONTRATO;
        
        if (!contractsMap.has(contractNumber)) {
          contractsMap.set(contractNumber, {
            numeroContrato: contractNumber,
            fornecedor: {
              id: `supplier_${contractNumber}`,
              razaoSocial: row.FORNECEDOR,
              cnpj: row.CNPJ || '',
              endereco: row.ENDERECO || '',
              telefone: row.TELEFONE || '',
              email: row.EMAIL || '',
              createdAt: getCurrentISOString(),
              updatedAt: getCurrentISOString()
            },
            valor: 0,
            dataInicio: getCurrentISOString(),
            dataFim: getCurrentISOString(),
            status: 'pendente',
            items: []
          });
        }
        
        const contract = contractsMap.get(contractNumber);
        const itemValue = Number(row.QUANTIDADE) * Number(row.VALOR_UNITARIO);
        
        contract.items.push({
          id: `item_${Date.now()}_${Math.random()}`,
          contractId: `contract_${contractNumber}`,
          description: row.PRODUTO,
          produto: row.PRODUTO,
          quantity: Number(row.QUANTIDADE),
          quantidadeContratada: Number(row.QUANTIDADE),
          unitPrice: Number(row.VALOR_UNITARIO),
          precoUnitario: Number(row.VALOR_UNITARIO),
          totalPrice: itemValue,
          valorTotalContrato: itemValue,
          unit: row.UNIDADE || 'Un',
          unidade: row.UNIDADE || 'Un',
          saldoQuantidade: Number(row.QUANTIDADE),
          saldoValor: itemValue,
          quantidadePaga: 0,
          valorPago: 0,
          createdAt: getCurrentISOString(),
          updatedAt: getCurrentISOString()
        });
        
        contract.valor += itemValue;
      });

      // Convert map to array and finalize contracts
      const contracts: ContractData[] = Array.from(contractsMap.values()).map(contract => ({
        id: `contract_${contract.numeroContrato}_${Date.now()}`,
        numeroContrato: contract.numeroContrato,
        fornecedor: contract.fornecedor,
        valor: contract.valor,
        valorTotal: contract.valor,
        dataInicio: getCurrentISOString(),
        dataFim: getCurrentISOString(),
        status: 'ativo',
        items: contract.items,
        createdAt: getCurrentISOString(),
        updatedAt: getCurrentISOString()
      }));

      onImport(contracts);
      setProcessed(true);
      
      toast({
        title: "Importação concluída",
        description: `${contracts.length} contrato(s) importado(s) com sucesso.`,
      });
      
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast({
        title: "Erro na importação",
        description: "Erro ao processar o arquivo Excel.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Importação de Contratos via Excel</CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 mb-3">
              Importar arquivo Excel com dados dos contratos
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Colunas obrigatórias: CONTRATO, FORNECEDOR, PRODUTO, QUANTIDADE, VALOR_UNITARIO
            </p>
            <Button onClick={() => document.getElementById("excel-upload")?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              Selecionar Arquivo
            </Button>
            <input
              type="file"
              id="excel-upload"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                <span className="font-medium">{file.name}</span>
              </div>
              
              {processing ? (
                <div className="flex items-center text-amber-600">
                  <span className="mr-2">Processando...</span>
                  <div className="h-4 w-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
                </div>
              ) : processed ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="mr-1 h-5 w-5" />
                  <span>Processado</span>
                </div>
              ) : (
                <Button onClick={processExcelFile}>
                  Processar Arquivo
                </Button>
              )}
            </div>

            {/* Validation Results */}
            {validationResult && !validationResult.valid && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-red-900">Erros encontrados no arquivo:</h4>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
