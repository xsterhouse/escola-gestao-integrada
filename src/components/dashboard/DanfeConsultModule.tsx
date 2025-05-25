import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, DollarSign, Building, Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DanfeConsultModule() {
  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchKey.trim()) return;
    
    setIsLoading(true);
    
    // Simulate search - in a real implementation, this would call an API
    setTimeout(() => {
      // Mock search results based on the access key
      const mockResults = [
        {
          id: "1",
          accessKey: searchKey,
          danfeNumber: "000001234",
          supplier: "Fornecedor Exemplo LTDA",
          issueDate: "2024-01-15",
          totalValue: 2500.00,
          status: "Autorizada",
          // Simulando que temos o XML e PDF base64 salvos
          xmlContent: `<?xml version="1.0" encoding="UTF-8"?><NFe><infNFe><ide><cUF>35</cUF><cNF>12345678</cNF><natOp>Venda</natOp><mod>55</mod><serie>1</serie><nNF>1234</nNF><dhEmi>2024-01-15T10:00:00-03:00</dhEmi></ide><emit><CNPJ>12345678000123</CNPJ><xNome>Fornecedor Exemplo LTDA</xNome></emit><total><ICMSTot><vNF>2500.00</vNF></ICMSTot></total></infNFe></NFe>`,
          pdfBase64: null // Será gerado quando necessário
        }
      ];
      
      setSearchResults(mockResults);
      setIsLoading(false);
    }, 1500);
  };

  const generatePdfFromXml = async (xmlContent: string): Promise<string> => {
    try {
      const response = await fetch('https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: xmlContent
      });

      if (response.status === 500) {
        throw new Error('Falha ao gerar PDF do Danfe confira seu XML.');
      }

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF do DANFE');
      }

      let pdfBase64 = await response.text();
      
      // Remove aspas duplas se existirem
      if (pdfBase64.startsWith('"') && pdfBase64.endsWith('"')) {
        pdfBase64 = pdfBase64.slice(1, -1);
      }

      return pdfBase64;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  };

  const handleExportPDF = async () => {
    if (searchResults.length === 0) return;
    
    try {
      const result = searchResults[0];
      
      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto o PDF do DANFE está sendo gerado...",
      });

      // Gera o PDF usando a API do MeuDANFE
      const pdfBase64 = await generatePdfFromXml(result.xmlContent);
      
      // Converte base64 para blob
      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Cria o link de download
      const a = document.createElement('a');
      a.href = url;
      a.download = `danfe_${result.danfeNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O arquivo PDF do DANFE foi baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: error instanceof Error ? error.message : "Erro desconhecido ao gerar PDF",
        variant: "destructive"
      });
    }
  };

  const handleSaveResults = () => {
    if (searchResults.length === 0) return;
    
    // Save to localStorage and state
    const existingSaved = JSON.parse(localStorage.getItem('savedDanfeResults') || '[]');
    const newSaved = [...existingSaved, ...searchResults.filter(result => 
      !existingSaved.some((saved: any) => saved.accessKey === result.accessKey)
    )];
    
    localStorage.setItem('savedDanfeResults', JSON.stringify(newSaved));
    setSavedResults(newSaved);
    
    toast({
      title: "Resultados salvos",
      description: "Os resultados da consulta DANFE foram salvos com sucesso.",
    });
  };

  const handleExportXML = () => {
    if (searchResults.length === 0) return;
    
    const result = searchResults[0];
    const blob = new Blob([result.xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danfe_${result.danfeNumber}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação XML concluída",
      description: "O arquivo XML foi baixado com sucesso.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="border-t-4 border-t-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Consulta DANFE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Section - Left Side */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Digite a chave de acesso do XML"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={!searchKey.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </div>

            {/* Action Buttons */}
            {searchResults.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleSaveResults}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
                <Button 
                  onClick={handleExportPDF}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button 
                  onClick={handleExportXML}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar XML
                </Button>
              </div>
            )}
          </div>

          {/* Results Section - Right Side */}
          <div className="space-y-3">
            {searchResults.length > 0 && (
              <>
                <h4 className="font-medium text-gray-900">Resultados da busca:</h4>
                {searchResults.map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">DANFE: {result.danfeNumber}</span>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {result.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{result.supplier}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Emissão: {formatDate(result.issueDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">{formatCurrency(result.totalValue)}</span>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <p className="text-xs text-gray-500">
                            Chave de acesso: {result.accessKey}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {searchResults.length === 0 && searchKey && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma DANFE encontrada para esta chave de acesso.</p>
                <p className="text-sm">Verifique se a chave foi digitada corretamente.</p>
              </div>
            )}

            {!searchKey && !isLoading && (
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Digite uma chave de acesso para iniciar a busca</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
