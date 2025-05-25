
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, DollarSign, Building, Download, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DanfeConsultModule() {
  const [xmlContent, setXmlContent] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const [danfeBase64, setDanfeBase64] = useState<string>("");
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!xmlContent.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o conteúdo XML da NFe.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setDanfeBase64("");
    
    try {
      // Chamar a API do MeuDANFE
      const response = await fetch('https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: xmlContent
      });

      if (response.status === 200) {
        const base64Response = await response.text();
        // Remove aspas duplas se existirem
        const cleanBase64 = base64Response.replace(/"/g, '');
        setDanfeBase64(cleanBase64);
        
        // Extrair informações do XML para exibir
        const mockResults = [
          {
            id: "1",
            xmlContent: xmlContent,
            danfeNumber: extractFromXml(xmlContent, 'nNF') || "N/A",
            supplier: extractFromXml(xmlContent, 'xNome') || "N/A",
            issueDate: extractFromXml(xmlContent, 'dhEmi') || new Date().toISOString().split('T')[0],
            totalValue: parseFloat(extractFromXml(xmlContent, 'vNF') || "0"),
            status: "Processado"
          }
        ];
        
        setSearchResults(mockResults);
        
        toast({
          title: "Sucesso",
          description: "DANFE gerado com sucesso!",
        });
      } else if (response.status === 500) {
        toast({
          title: "Erro",
          description: "Falha ao gerar PDF do DANFE! Confira o seu XML",
          variant: "destructive",
        });
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erro ao processar XML:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o serviço. Tente novamente.",
        variant: "destructive",
      });
      setSearchResults([]);
    }
    
    setIsLoading(false);
  };

  const extractFromXml = (xml: string, tag: string): string | null => {
    const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : null;
  };

  const handleSaveResults = () => {
    if (searchResults.length === 0) return;
    
    // Save to localStorage and state
    const existingSaved = JSON.parse(localStorage.getItem('savedDanfeResults') || '[]');
    const newSaved = [...existingSaved, ...searchResults.filter(result => 
      !existingSaved.some((saved: any) => saved.danfeNumber === result.danfeNumber)
    )];
    
    localStorage.setItem('savedDanfeResults', JSON.stringify(newSaved));
    setSavedResults(newSaved);
    
    toast({
      title: "Resultados salvos",
      description: "Os resultados da consulta DANFE foram salvos com sucesso.",
    });
  };

  const handleExportPDF = () => {
    if (!danfeBase64) {
      toast({
        title: "Erro",
        description: "Nenhum DANFE disponível para exportar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(danfeBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danfe_${searchResults[0]?.danfeNumber || 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportação PDF concluída",
        description: "O arquivo PDF foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExportXML = () => {
    if (searchResults.length === 0 || !searchResults[0]?.xmlContent) {
      toast({
        title: "Erro",
        description: "Nenhum XML disponível para exportar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const blob = new Blob([searchResults[0].xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfe_${searchResults[0]?.danfeNumber || 'documento'}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportação XML concluída",
        description: "O arquivo XML foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar XML:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar XML. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleViewPDF = () => {
    if (!danfeBase64) return;
    
    // Abrir PDF em nova aba
    const pdfUrl = `data:application/pdf;base64,${danfeBase64}`;
    window.open(pdfUrl, '_blank');
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
            <div className="space-y-2">
              <label htmlFor="xmlInput" className="text-sm font-medium">
                XML da NFe:
              </label>
              <textarea
                id="xmlInput"
                placeholder="Cole aqui o conteúdo XML completo da NFe..."
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none text-sm"
              />
            </div>
            
            <Button 
              onClick={handleSearch} 
              disabled={!xmlContent.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Processando..." : "Gerar DANFE"}
            </Button>

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
                  disabled={!danfeBase64}
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
                {danfeBase64 && (
                  <Button 
                    onClick={handleViewPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Visualizar PDF
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Results Section - Right Side */}
          <div className="space-y-3">
            {searchResults.length > 0 && (
              <>
                <h4 className="font-medium text-gray-900">Resultado do processamento:</h4>
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
                        
                        {danfeBase64 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs text-green-600">
                              ✓ DANFE gerado com sucesso
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {searchResults.length === 0 && xmlContent && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum resultado encontrado.</p>
                <p className="text-sm">Verifique se o XML está correto.</p>
              </div>
            )}

            {!xmlContent && !isLoading && (
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Cole o conteúdo XML da NFe para gerar o DANFE</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
