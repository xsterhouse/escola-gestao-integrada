import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { ContractData, ContractImportData, ContractDivergence, PlanningItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getATAByNumber, ATAForContracts } from "@/utils/ataUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DivergenceResolutionModal } from "./DivergenceResolutionModal";

interface ExcelImportSectionProps {
  onImport: (contractData: ContractData) => void;
}

interface ImportedContract {
  ataId: string;
  contractId: string;
  importedAt: string;
}

interface ValidationResult {
  isValid: boolean;
  hasDivergences: boolean;
  divergences: ContractDivergence[];
  contractData: ContractData;
}

export function ExcelImportSection({ onImport }: ExcelImportSectionProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ataId, setAtaId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showDivergenceModal, setShowDivergenceModal] = useState(false);

  const getImportedContracts = (): ImportedContract[] => {
    try {
      const stored = localStorage.getItem("importedContracts");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading imported contracts:", error);
      return [];
    }
  };

  const saveImportedContract = (ataId: string, contractId: string) => {
    try {
      const imported = getImportedContracts();
      const newImport: ImportedContract = {
        ataId,
        contractId,
        importedAt: new Date().toISOString()
      };
      imported.push(newImport);
      localStorage.setItem("importedContracts", JSON.stringify(imported));
    } catch (error) {
      console.error("Error saving imported contract:", error);
    }
  };

  const compareItems = (contractItems: any[], ataItems: PlanningItem[]): ContractDivergence[] => {
    const divergences: ContractDivergence[] = [];

    contractItems.forEach((contractItem, contractIndex) => {
      // Find corresponding ATA item by description similarity
      const ataItem = ataItems.find(item => {
        const contractDesc = contractItem.produto.toLowerCase().trim();
        const ataDesc = item.description.toLowerCase().trim();
        
        // Check for partial match (at least 70% similarity in words)
        const contractWords = contractDesc.split(' ');
        const ataWords = ataDesc.split(' ');
        const commonWords = contractWords.filter(word => 
          ataWords.some(ataWord => ataWord.includes(word) || word.includes(ataWord))
        );
        
        return commonWords.length >= Math.min(contractWords.length, ataWords.length) * 0.7;
      });

      if (!ataItem) {
        // Item not found in ATA - major divergence
        divergences.push({
          id: `div-${contractIndex}-notfound`,
          contractItemId: `contract-item-${contractIndex}`,
          ataItemId: '',
          field: 'descricao',
          valorContrato: contractItem.produto,
          valorATA: 'Não encontrado na ATA',
          resolved: false
        });
        return;
      }

      // Compare description
      if (contractItem.produto.toLowerCase() !== ataItem.description.toLowerCase()) {
        divergences.push({
          id: `div-${contractIndex}-desc`,
          contractItemId: `contract-item-${contractIndex}`,
          ataItemId: ataItem.id,
          field: 'descricao',
          valorContrato: contractItem.produto,
          valorATA: ataItem.description,
          resolved: false
        });
      }

      // Compare unit
      if (contractItem.unidade && ataItem.unit && 
          contractItem.unidade.toLowerCase() !== ataItem.unit.toLowerCase()) {
        divergences.push({
          id: `div-${contractIndex}-unit`,
          contractItemId: `contract-item-${contractIndex}`,
          ataItemId: ataItem.id,
          field: 'unidade',
          valorContrato: contractItem.unidade,
          valorATA: ataItem.unit,
          resolved: false
        });
      }

      // Compare quantity (contract can't exceed ATA)
      if (contractItem.quantidadeContratada > ataItem.quantity) {
        divergences.push({
          id: `div-${contractIndex}-qty`,
          contractItemId: `contract-item-${contractIndex}`,
          ataItemId: ataItem.id,
          field: 'quantidade',
          valorContrato: contractItem.quantidadeContratada,
          valorATA: ataItem.quantity,
          resolved: false
        });
      }

      // Compare unit price (tolerance of 5%)
      if (ataItem.unitPrice && contractItem.precoUnitario) {
        const tolerance = ataItem.unitPrice * 0.05;
        const priceDiff = Math.abs(contractItem.precoUnitario - ataItem.unitPrice);
        
        if (priceDiff > tolerance) {
          divergences.push({
            id: `div-${contractIndex}-price`,
            contractItemId: `contract-item-${contractIndex}`,
            ataItemId: ataItem.id,
            field: 'valorUnitario',
            valorContrato: contractItem.precoUnitario,
            valorATA: ataItem.unitPrice,
            resolved: false
          });
        }
      }
    });

    return divergences;
  };

  const getSchoolIdFromPlanning = (ataNumber: string): string | null => {
    try {
      // Try to find the school ID by looking through all planning data
      const allSchools = JSON.parse(localStorage.getItem("schools") || "[]");
      
      for (const school of allSchools) {
        const schoolPlanning = JSON.parse(localStorage.getItem(`plans_${school.id}`) || "[]");
        const planningWithATA = schoolPlanning.find((p: any) => p.ataNumber === ataNumber);
        if (planningWithATA) {
          return school.id;
        }
      }
      
      // Fallback: use current user's school ID if available
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      return currentUser.schoolId || null;
    } catch (error) {
      console.error("Error finding school ID for ATA:", error);
      return null;
    }
  };

  const validateAndImport = async () => {
    if (!ataId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o ID da ATA",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      // Get ATA data including planning items
      const ata = getATAByNumber(ataId);
      if (!ata) {
        toast({
          title: "Erro na Validação",
          description: `ATA ${ataId} não encontrada no sistema`,
          variant: "destructive",
        });
        return;
      }

      if (ata.status !== "aprovada") {
        toast({
          title: "Erro na Validação",
          description: `ATA ${ataId} não está aprovada. Apenas ATAs aprovadas podem ser usadas para importação`,
          variant: "destructive",
        });
        return;
      }

      // Check if already imported
      const importedContracts = getImportedContracts();
      const alreadyImported = importedContracts.find(contract => contract.ataId === ataId);
      if (alreadyImported) {
        toast({
          title: "Erro na Validação",
          description: `ATA ${ataId} já foi importada anteriormente`,
          variant: "destructive",
        });
        return;
      }

      // Get school ID for the ATA
      const schoolId = getSchoolIdFromPlanning(ataId);
      if (!schoolId) {
        toast({
          title: "Erro na Validação",
          description: `Não foi possível encontrar a escola associada à ATA ${ataId}`,
          variant: "destructive",
        });
        return;
      }

      // Get ATA planning items
      const ataPlanning = JSON.parse(localStorage.getItem(`plans_${schoolId}`) || "[]");
      const planningItems = ataPlanning.find(p => p.ataNumber === ataId)?.items || [];

      if (planningItems.length === 0) {
        toast({
          title: "Erro na Validação",
          description: `Não foram encontrados itens no planejamento da ATA ${ataId}`,
          variant: "destructive",
        });
        return;
      }

      // Mock contract data (in real implementation, parse Excel file)
      const mockContractItems = [
        {
          produto: "Arroz Tipo 1 - 5kg",
          quantidadeContratada: 800,
          precoUnitario: 25.50,
          unidade: "Un"
        },
        {
          produto: "Feijão Carioca - 1kg", 
          quantidadeContratada: 400,
          precoUnitario: 8.90,
          unidade: "Un"
        }
      ];

      // Compare items and find divergences
      const divergences = compareItems(mockContractItems, planningItems);

      // Create contract data
      const contractData: ContractData = {
        id: `contract-${Date.now()}`,
        numeroContrato: `${ataId}-CONTRACT`,
        ataId: ataId,
        fornecedorId: "fornecedor-1",
        fornecedor: {
          id: "fornecedor-1",
          cnpj: "12.345.678/0001-90",
          razaoSocial: "PAULISTA INDÚSTRIA E COMÉRCIO DE ALIMENTOS LTDA",
          name: "PAULISTA INDÚSTRIA E COMÉRCIO DE ALIMENTOS LTDA",
          endereco: "Rua das Indústrias, 123 - São Paulo/SP",
          telefone: "(11) 1234-5678",
          email: "contato@paulista.com.br",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        dataInicio: new Date(ata.dataInicioVigencia),
        dataFim: new Date(ata.dataFimVigencia),
        status: divergences.length > 0 ? 'divergencia_dados' : 'ativo',
        items: mockContractItems.map((item, index) => ({
          id: `item-${index + 1}`,
          contractId: `contract-${Date.now()}`,
          produto: item.produto,
          quantidadeContratada: item.quantidadeContratada,
          precoUnitario: item.precoUnitario,
          valorTotalContrato: item.quantidadeContratada * item.precoUnitario,
          quantidadePaga: 0,
          valorPago: 0,
          saldoQuantidade: item.quantidadeContratada,
          saldoValor: item.quantidadeContratada * item.precoUnitario,
          notasFiscais: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        divergencias: divergences,
        ataValidated: divergences.length === 0,
        lastValidationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validationResult: ValidationResult = {
        isValid: divergences.length === 0,
        hasDivergences: divergences.length > 0,
        divergences,
        contractData
      };

      setValidationResult(validationResult);

      if (divergences.length > 0) {
        setShowDivergenceModal(true);
      } else {
        // No divergences, import directly
        saveImportedContract(ataId, contractData.id);
        onImport(contractData);
        
        toast({
          title: "Sucesso",
          description: `Contrato importado com sucesso para ATA ${ataId}!`,
        });

        setIsModalOpen(false);
        setAtaId("");
        setSelectedFile(null);
      }

    } catch (error) {
      console.error("Error during validation:", error);
      toast({
        title: "Erro",
        description: "Erro ao validar importação",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImportWithDivergences = () => {
    if (!validationResult) return;

    saveImportedContract(ataId, validationResult.contractData.id);
    onImport(validationResult.contractData);
    
    toast({
      title: "Contrato Importado com Divergências",
      description: `Contrato importado com ${validationResult.divergences.length} divergência(s). Resolva as divergências na aba de acompanhamento.`,
      variant: "destructive",
    });

    setIsModalOpen(false);
    setShowDivergenceModal(false);
    setAtaId("");
    setSelectedFile(null);
    setValidationResult(null);
  };

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

    setSelectedFile(file);
    setIsModalOpen(true);
    
    // Clear input
    event.target.value = '';
  }, [toast]);

  return (
    <>
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
            <p><strong>Processo de importação:</strong></p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Selecione a planilha Excel com os dados do contrato</li>
              <li>Informe o ID da ATA aprovada (ex: ATA001, ATA002, etc.)</li>
              <li>O sistema validará se a ATA existe e está aprovada</li>
              <li>Os itens do contrato serão validados contra o planejamento da ATA</li>
              <li>Cada ATA só pode ser importada uma única vez</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validação da ATA</DialogTitle>
            <DialogDescription>
              Informe o ID da ATA aprovada para validar a importação do contrato.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ID da ATA
              </label>
              <Input
                placeholder="Ex: ATA001, ATA002..."
                value={ataId}
                onChange={(e) => setAtaId(e.target.value.toUpperCase())}
              />
              <p className="text-sm text-gray-500 mt-1">
                Digite o ID da ATA aprovada (gerado no planejamento)
              </p>
            </div>

            {selectedFile && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm">
                  <strong>Arquivo selecionado:</strong> {selectedFile.name}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setAtaId("");
                  setSelectedFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={validateAndImport}
                disabled={isValidating || !ataId.trim()}
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Validando...
                  </>
                ) : (
                  "Validar e Importar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showDivergenceModal && validationResult && (
        <DivergenceResolutionModal
          divergences={validationResult.divergences}
          contractData={validationResult.contractData}
          ataId={ataId}
          onImportWithDivergences={handleImportWithDivergences}
          onCancel={() => {
            setShowDivergenceModal(false);
            setValidationResult(null);
          }}
        />
      )}
    </>
  );
}
