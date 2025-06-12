
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContractData, ContractDivergence, ContractItem, Supplier } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DivergenceResolutionModal } from "./DivergenceResolutionModal";
import { getATAByNumber } from "@/utils/ataUtils";

interface ExcelImportSectionProps {
  onImport: (contractData: ContractData) => void;
}

interface ImportResult {
  contractData: ContractData;
  divergences: ContractDivergence[];
  ataId: string;
}

export function ExcelImportSection({ onImport }: ExcelImportSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const processExcelFile = async () => {
    if (!file) return;

    setProcessing(true);

    setTimeout(() => {
      try {
        const mockSupplier: Supplier = {
          id: "supplier-123",
          cnpj: "12.345.678/0001-90",
          razaoSocial: "Fornecedor ABC Ltda",
          name: "Fornecedor ABC Ltda",
          endereco: "Rua das Flores, 123 - Centro",
          address: "Rua das Flores, 123 - Centro",
          telefone: "(11) 1234-5678",
          phone: "(11) 1234-5678",
          email: "contato@fornecedor.com.br",
          contactPerson: "João Silva",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234-567",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const mockItems: ContractItem[] = [
          {
            id: "item-1",
            produto: "Arroz Tipo 1 - 5kg",
            description: "Arroz Tipo 1 - 5kg",
            quantidade: 150,
            quantity: 150,
            valorUnitario: 25.50,
            unitPrice: 25.50,
            valorTotal: 3825.00,
            totalPrice: 3825.00,
            quantidadeUtilizada: 0,
            saldoDisponivel: 150,
            quantidadeContratada: 150,
            precoUnitario: 25.50,
            valorTotalContrato: 3825.00,
            notasFiscais: [],
            quantidadePaga: 0,
            valorPago: 0,
            saldoQuantidade: 150,
            saldoValor: 3825.00,
            unit: "kg",
            contractId: "contract-123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        const mockContractData: ContractData = {
          id: "contract-123",
          ataId: "ATA-2024-001",
          numeroContrato: "CONT-001/2024",
          fornecedor: mockSupplier,
          items: mockItems,
          status: 'ativo',
          dataInicio: new Date().toISOString(),
          dataFim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          valorTotal: 3825.00,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const mockDivergences: ContractDivergence[] = [
          {
            id: "div-1",
            contractItemId: "item-1",
            itemId: "",
            field: "quantidade",
            type: "quantity",
            description: "Divergência na quantidade contratada",
            expectedValue: "200",
            actualValue: "150",
            valorContrato: 150,
            valorATA: 200,
            status: "pending",
            contractId: "contract-123",
            createdAt: new Date().toISOString()
          }
        ];

        setImportResult({
          contractData: mockContractData,
          divergences: mockDivergences,
          ataId: "ATA-2024-001"
        });

        setProcessing(false);
        
        toast({
          title: "Arquivo processado",
          description: "Contrato processado com divergências encontradas",
          variant: "default",
        });
      } catch (error) {
        setProcessing(false);
        toast({
          title: "Erro no processamento",
          description: "Não foi possível processar o arquivo Excel",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleImportWithDivergences = () => {
    if (!importResult) return;

    const contractWithDivergences: ContractData = {
      ...importResult.contractData,
      status: 'divergencia_dados',
      divergencias: importResult.divergences,
      ataValidated: false,
      lastValidationAt: new Date().toISOString()
    };

    onImport(contractWithDivergences);
    setImportResult(null);
    setFile(null);
  };

  const handleCancelImport = () => {
    setImportResult(null);
    toast({
      title: "Importação cancelada",
      description: "O contrato não foi importado devido às divergências",
    });
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template-contrato.xlsx';
    link.download = 'template-contrato.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>1. Importação de Contratos Excel</span>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Baixar Template
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500 mb-4">
                Arraste e solte seu arquivo Excel (.xlsx) aqui, ou clique para selecionar
              </p>
              <Button onClick={() => document.getElementById("excel-upload")?.click()}>
                <FileText className="mr-2 h-4 w-4" />
                Selecionar Excel
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
                  <FileText className="mr-2 h-5 w-5 text-green-500" />
                  <span className="font-medium">{file.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                
                {processing ? (
                  <div className="flex items-center text-amber-600">
                    <span className="mr-2">Processando...</span>
                    <div className="h-4 w-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button onClick={processExcelFile}>
                      Processar Arquivo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {importResult && (
        <DivergenceResolutionModal
          divergences={importResult.divergences}
          contractData={importResult.contractData}
          ataId={importResult.ataId}
          onImportWithDivergences={handleImportWithDivergences}
          onCancel={handleCancelImport}
        />
      )}
    </>
  );
}
