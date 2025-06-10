
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contract } from "@/lib/types";

interface LicitationImportSectionProps {
  onImport: (contracts: Contract[]) => void;
}

export function LicitationImportSection({ onImport }: LicitationImportSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProcessed(false);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    
    // Simular processamento do arquivo
    setTimeout(() => {
      const mockContracts: Contract[] = [
        {
          id: "1",
          number: "001/2024",
          supplier: "Papelaria ABC Ltda",
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          value: 25000.00,
          status: 'ativo',
          items: [],
          itensContratados: ["Caderno", "Caneta", "Lápis"],
          quantidade: 1500,
          valorContratado: 25000.00
        },
        {
          id: "2",
          number: "002/2024", 
          supplier: "Material Escolar XYZ",
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-11-30'),
          value: 15000.00,
          status: 'ativo',
          items: [],
          itensContratados: ["Borracha", "Régua", "Apontador"],
          quantidade: 800,
          valorContratado: 15000.00
        }
      ];

      onImport(mockContracts);
      setProcessed(true);
      setProcessing(false);
      
      toast({
        title: "Dados importados com sucesso",
        description: "Relação de vencedores da licitação foi processada.",
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Importação da Relação de Vencedores das Licitações</CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 mb-3">
              Importar arquivo CSV ou Excel com os vencedores da licitação
            </p>
            <Button onClick={() => document.getElementById("licitacao-upload")?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              Selecionar Arquivo
            </Button>
            <input
              type="file"
              id="licitacao-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-green-500" />
                <span className="font-medium">{file.name}</span>
              </div>
              
              {processing ? (
                <div className="flex items-center text-amber-600">
                  <span className="mr-2">Processando...</span>
                  <div className="h-4 w-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
                </div>
              ) : processed ? (
                <div className="flex items-center text-green-600">
                  <Check className="mr-1 h-5 w-5" />
                  <span>Processado</span>
                </div>
              ) : (
                <Button onClick={processFile}>
                  Processar Arquivo
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
