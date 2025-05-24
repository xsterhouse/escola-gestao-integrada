import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceData } from "@/lib/types";

interface XmlImportSectionProps {
  onImport: (invoiceData: InvoiceData) => void;
}

export function XmlImportSection({ onImport }: XmlImportSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.xml')) {
      setFile(selectedFile);
      setProcessed(false);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo XML válido.",
        variant: "destructive"
      });
    }
  };

  const processXmlFile = async () => {
    if (!file) return;

    setProcessing(true);
    
    // Simular processamento do XML
    setTimeout(() => {
      const mockInvoiceData: InvoiceData = {
        id: Date.now().toString(),
        supplier: {
          cnpj: "12.345.678/0001-90",
          razaoSocial: "Fornecedor Exemplo Ltda",
          endereco: "Rua das Flores, 123 - Centro",
          telefone: "(11) 1234-5678",
          email: "contato@fornecedor.com.br"
        },
        dataEmissao: new Date(),
        numeroDanfe: "123456789",
        valorTotal: 15750.00,
        items: [
          {
            id: "1",
            description: "Caderno Universitário 200 folhas",
            quantity: 500,
            unitPrice: 12.50,
            totalPrice: 6250.00,
            unitOfMeasure: "Un",
            invoiceId: Date.now().toString()
          },
          {
            id: "2", 
            description: "Caneta Esferográfica Azul",
            quantity: 1000,
            unitPrice: 2.50,
            totalPrice: 2500.00,
            unitOfMeasure: "Un",
            invoiceId: Date.now().toString()
          },
          {
            id: "3",
            description: "Lápis HB Grafite",
            quantity: 2000,
            unitPrice: 1.00,
            totalPrice: 2000.00,
            unitOfMeasure: "Un",
            invoiceId: Date.now().toString()
          }
        ]
      };

      onImport(mockInvoiceData);
      setProcessed(true);
      setProcessing(false);
      
      toast({
        title: "XML processado com sucesso",
        description: "Dados da nota fiscal foram importados.",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Importação de XML de Nota Fiscal (NFe)</CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-4">
              Arraste e solte seu arquivo XML da NFe aqui, ou clique para selecionar
            </p>
            <Button onClick={() => document.getElementById("xml-upload")?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              Selecionar XML
            </Button>
            <input
              type="file"
              id="xml-upload"
              className="hidden"
              accept=".xml"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                <span className="font-medium">{file.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              
              {processing ? (
                <div className="flex items-center text-amber-600">
                  <span className="mr-2">Processando XML...</span>
                  <div className="h-4 w-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
                </div>
              ) : processed ? (
                <div className="flex items-center text-green-600">
                  <Check className="mr-1 h-5 w-5" />
                  <span>Processado</span>
                </div>
              ) : (
                <Button onClick={processXmlFile}>
                  Processar XML
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
