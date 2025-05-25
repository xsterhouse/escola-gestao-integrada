
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Calendar, DollarSign, Building, Download, Save, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedDanfe {
  id: string;
  danfeNumber: string;
  supplier: string;
  issueDate: string;
  totalValue: number;
  xmlContent: string;
  danfeBase64: string;
  savedAt: string;
}

export function DanfeConsultModule() {
  const [xmlContent, setXmlContent] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedResults, setSavedResults] = useState<SavedDanfe[]>([]);
  const [danfeBase64, setDanfeBase64] = useState<string>("");
  const { toast } = useToast();

  // Carregar DANFEs salvos ao montar o componente
  useEffect(() => {
    const saved = localStorage.getItem('savedDanfeResults');
    if (saved) {
      setSavedResults(JSON.parse(saved));
    }
  }, []);

  const isAccessKey = (input: string): boolean => {
    // Chave de acesso tem 44 dígitos
    return /^\d{44}$/.test(input.replace(/\s/g, ''));
  };

  const isXmlContent = (input: string): boolean => {
    // Verifica se contém tags XML básicas da NFe
    return input.includes('<nfeProc') || input.includes('<NFe') || input.includes('<infNFe');
  };

  const handleSearch = async () => {
    if (!xmlContent.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira a chave de acesso ou o conteúdo XML da NFe.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setDanfeBase64("");
    setSearchResults([]);
    
    try {
      let xmlToSend = xmlContent.trim();
      
      // Se for apenas a chave de acesso, mostrar mensagem explicativa
      if (isAccessKey(xmlContent.trim())) {
        toast({
          title: "Informação",
          description: "Para consultar por chave de acesso, é necessário o XML completo da NFe. Cole o conteúdo XML completo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Verificar se é conteúdo XML válido
      if (!isXmlContent(xmlToSend)) {
        toast({
          title: "Erro",
          description: "O conteúdo inserido não parece ser um XML válido de NFe.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Chamar a API do MeuDANFE
      const response = await fetch('https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: xmlToSend
      });

      if (response.status === 200) {
        const base64Response = await response.text();
        // Remove aspas duplas se existirem
        const cleanBase64 = base64Response.replace(/"/g, '');
        setDanfeBase64(cleanBase64);
        
        // Extrair informações do XML para exibir
        const mockResults = [
          {
            id: Date.now().toString(),
            xmlContent: xmlToSend,
            danfeNumber: extractFromXml(xmlToSend, 'nNF') || "N/A",
            supplier: extractFromXml(xmlToSend, 'xNome') || "N/A",
            issueDate: extractFromXml(xmlToSend, 'dhEmi') || new Date().toISOString().split('T')[0],
            totalValue: parseFloat(extractFromXml(xmlToSend, 'vNF') || "0"),
            status: "Processado",
            danfeBase64: cleanBase64
          }
        ];
        
        setSearchResults(mockResults);
        
        toast({
          title: "Sucesso",
          description: "DANFE gerado com sucesso! Você pode salvá-lo agora.",
        });
      } else if (response.status === 500) {
        toast({
          title: "Erro",
          description: "Falha ao gerar PDF do DANFE! Confira o seu XML - verifique se está completo e válido.",
          variant: "destructive",
        });
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erro ao processar XML:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o serviço. Verifique sua conexão e tente novamente.",
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
    if (searchResults.length === 0 || !danfeBase64) {
      toast({
        title: "Erro",
        description: "Nenhum DANFE disponível para salvar.",
        variant: "destructive",
      });
      return;
    }
    
    const resultToSave: SavedDanfe = {
      id: Date.now().toString(),
      danfeNumber: searchResults[0].danfeNumber,
      supplier: searchResults[0].supplier,
      issueDate: searchResults[0].issueDate,
      totalValue: searchResults[0].totalValue,
      xmlContent: searchResults[0].xmlContent,
      danfeBase64: danfeBase64,
      savedAt: new Date().toISOString()
    };
    
    // Verificar se já existe
    const exists = savedResults.some(saved => saved.danfeNumber === resultToSave.danfeNumber);
    if (exists) {
      toast({
        title: "Aviso",
        description: "Este DANFE já foi salvo anteriormente.",
        variant: "destructive",
      });
      return;
    }
    
    const newSaved = [resultToSave, ...savedResults];
    setSavedResults(newSaved);
    localStorage.setItem('savedDanfeResults', JSON.stringify(newSaved));
    
    toast({
      title: "DANFE salvo",
      description: "O DANFE foi salvo com sucesso na tabela abaixo.",
    });
  };

  const handleExportPDF = (base64Data?: string) => {
    const pdfData = base64Data || danfeBase64;
    if (!pdfData) {
      toast({
        title: "Erro",
        description: "Nenhum DANFE disponível para exportar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const byteCharacters = atob(pdfData);
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
        title: "PDF baixado",
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

  const handleExportXML = (xmlData?: string) => {
    const xmlToExport = xmlData || searchResults[0]?.xmlContent;
    if (!xmlToExport) {
      toast({
        title: "Erro",
        description: "Nenhum XML disponível para exportar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const blob = new Blob([xmlToExport], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfe_${searchResults[0]?.danfeNumber || 'documento'}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "XML baixado",
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

  const handleViewPDF = (base64Data?: string) => {
    const pdfData = base64Data || danfeBase64;
    if (!pdfData) return;
    
    const pdfUrl = `data:application/pdf;base64,${pdfData}`;
    window.open(pdfUrl, '_blank');
  };

  const handleDeleteSaved = (id: string) => {
    const newSaved = savedResults.filter(item => item.id !== id);
    setSavedResults(newSaved);
    localStorage.setItem('savedDanfeResults', JSON.stringify(newSaved));
    
    toast({
      title: "DANFE removido",
      description: "O DANFE foi removido da lista.",
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
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
                  Digite a chave de acesso do XML:
                </label>
                <textarea
                  id="xmlInput"
                  placeholder="Cole aqui o conteúdo XML completo da NFe..."
                  value={xmlContent}
                  onChange={(e) => setXmlContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none text-sm"
                />
                <p className="text-xs text-gray-500">
                  ⚠️ Atenção: É necessário o XML completo da NFe, não apenas a chave de acesso.
                </p>
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
              {searchResults.length > 0 && danfeBase64 && (
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleSaveResults}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar DANFE
                  </Button>
                  <Button 
                    onClick={() => handleExportPDF()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button 
                    onClick={() => handleExportXML()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar XML
                  </Button>
                  <Button 
                    onClick={() => handleViewPDF()}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Visualizar PDF
                  </Button>
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
                                ✓ DANFE gerado com sucesso - Pronto para salvar
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
                  <p className="text-sm">Verifique se o XML está correto e completo.</p>
                </div>
              )}

              {!xmlContent && !isLoading && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Cole o conteúdo XML completo da NFe para gerar o DANFE</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de DANFEs Salvos */}
      {savedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              DANFEs Salvos ({savedResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número DANFE</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Salvo em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedResults.map((saved) => (
                    <TableRow key={saved.id}>
                      <TableCell className="font-medium">{saved.danfeNumber}</TableCell>
                      <TableCell>{saved.supplier}</TableCell>
                      <TableCell>{formatDate(saved.issueDate)}</TableCell>
                      <TableCell>{formatCurrency(saved.totalValue)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateTime(saved.savedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPDF(saved.danfeBase64)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportPDF(saved.danfeBase64)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportXML(saved.xmlContent)}
                            className="h-8 w-8 p-0"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSaved(saved.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
