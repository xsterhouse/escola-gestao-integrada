
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Calendar, DollarSign, Building, Download, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DanfeConsultModule() {
  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Carregar dados salvos do localStorage na inicialização
  useEffect(() => {
    const saved = localStorage.getItem('savedDanfeResults');
    if (saved) {
      setSavedResults(JSON.parse(saved));
    }
  }, []);

  // Função para consultar NFe na API real
  const consultNFeAPI = async (accessKey: string): Promise<any> => {
    try {
      console.log('🔍 Consultando NFe na API oficial com chave:', accessKey);
      
      const response = await fetch('https://ws.meudanfe.com/api/v1/get/nfe/chave/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chave: accessKey
        })
      });

      if (response.ok) {
        const data = await response.text();
        console.log('✅ Dados recebidos da API:', data.substring(0, 200) + '...');
        return data;
      } else {
        console.error('❌ Erro na consulta API:', response.status);
        throw new Error(`Erro na API: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao consultar API:', error);
      throw error;
    }
  };

  // Função para extrair dados do XML retornado pela API
  const parseXMLResponse = (xmlContent: string, accessKey: string) => {
    try {
      console.log('🔧 Extraindo dados do XML retornado pela API...');
      
      // Criar parser DOM para extrair dados reais do XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      
      // Extrair dados reais do emissor
      const emit = xmlDoc.querySelector('emit');
      const supplierName = emit?.querySelector('xNome')?.textContent || 'Fornecedor não identificado';
      const supplierCNPJ = emit?.querySelector('CNPJ')?.textContent || '';
      
      // Extrair dados da NFe
      const ide = xmlDoc.querySelector('ide');
      const danfeNumber = ide?.querySelector('nNF')?.textContent || '';
      const issueDate = ide?.querySelector('dhEmi')?.textContent || '';
      
      // Extrair valor total
      const total = xmlDoc.querySelector('ICMSTot');
      const totalValue = parseFloat(total?.querySelector('vNF')?.textContent || '0');
      
      console.log('✅ Dados extraídos:', {
        supplier: supplierName,
        cnpj: supplierCNPJ,
        danfe: danfeNumber,
        value: totalValue
      });
      
      return {
        id: Date.now().toString(),
        accessKey: accessKey,
        danfeNumber: danfeNumber,
        supplier: supplierName,
        cnpj: supplierCNPJ,
        issueDate: issueDate ? new Date(issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        totalValue: totalValue,
        status: "Autorizada",
        xmlContent: xmlContent
      };
    } catch (error) {
      console.error('❌ Erro ao processar XML:', error);
      throw new Error('Erro ao processar dados da NFe');
    }
  };

  const handleSearch = async () => {
    if (!searchKey.trim()) return;
    
    setIsLoading(true);
    
    try {
      console.log('🚀 Iniciando busca real da NFe...');
      
      // Fazer consulta real na API
      const xmlResponse = await consultNFeAPI(searchKey);
      
      // Extrair dados reais do XML
      const nfeData = parseXMLResponse(xmlResponse, searchKey);
      
      const mockResults = [nfeData];
      setSearchResults(mockResults);
      
      // Salvar automaticamente no localStorage
      const existingSaved = JSON.parse(localStorage.getItem('savedDanfeResults') || '[]');
      const newSaved = [...existingSaved, ...mockResults.filter(result => 
        !existingSaved.some((saved: any) => saved.accessKey === result.accessKey)
      )];
      
      localStorage.setItem('savedDanfeResults', JSON.stringify(newSaved));
      setSavedResults(newSaved);
      
      console.log('✅ Busca concluída com dados reais da NFe');
      
      toast({
        title: "NFe encontrada",
        description: `DANFE ${nfeData.danfeNumber} - ${nfeData.supplier}`,
      });
      
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar a NFe. Verifique a chave de acesso.",
        variant: "destructive"
      });
      
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Etapa 1: Validar XML antes de processar - CORRIGIDA
  const validateXmlContent = (xmlContent: string): boolean => {
    console.log('🔍 Etapa 1: Validando XML...');
    
    // Verificar campos obrigatórios do XML NFe com verificação mais flexível
    const requiredFields = [
      { field: 'protNFe', pattern: /<protNFe/i },
      { field: 'det', pattern: /<det\s/i },
      { field: 'dest', pattern: /<dest>/i },
      { field: 'emit', pattern: /<emit>/i },
      { field: 'infNFe', pattern: /<infNFe/i }
    ];
    
    for (const req of requiredFields) {
      if (!req.pattern.test(xmlContent)) {
        console.error(`❌ Campo obrigatório não encontrado: ${req.field}`);
        return false;
      }
    }
    
    console.log('✅ XML validado com sucesso - todos os campos obrigatórios encontrados');
    return true;
  };

  // Etapa 2: Gerar DANFE via API
  const generatePdfFromXml = async (xmlContent: string): Promise<string> => {
    try {
      console.log('🔧 Etapa 2: Enviando XML para API do DANFE...');
      
      // Validar XML antes de enviar
      if (!validateXmlContent(xmlContent)) {
        throw new Error('XML inválido - campos obrigatórios não encontrados');
      }
      
      const response = await fetch('https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xmlContent
      });

      console.log('📊 Etapa 3: Verificando Status da Resposta...');
      
      // Etapa 3: Verificar Status
      if (response.status === 200) {
        console.log('✅ Status 200 - Continuando processamento...');
        
        let pdfBase64 = await response.text();
        
        console.log('🧹 Etapa 4: Tratando PDF em Base64...');
        
        // Etapa 4: Remover aspas duplas se estiverem presentes
        pdfBase64 = pdfBase64.replace(/^"|"$/g, "");
        
        console.log('🔗 Etapa 5: Gerando URL de visualização...');
        console.log('✅ PDF gerado com sucesso via API');
        
        return pdfBase64;
      } else if (response.status === 500) {
        console.error('❌ Status 500 - Falha na API');
        throw new Error('Falha ao gerar PDF do DANFE! Confira o seu XML');
      } else {
        console.error(`❌ Status ${response.status} - Erro inesperado`);
        throw new Error(`Erro na API: Status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro completo no processamento:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro desconhecido ao gerar PDF');
    }
  };

  const handleExportPDF = async (result: any) => {
    try {
      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto o PDF do DANFE está sendo gerado...",
      });

      // Gera o PDF usando a nova API seguindo o fluxo completo
      const pdfBase64 = await generatePdfFromXml(result.xmlContent);
      
      // Etapa 5: Criar URL para visualização no navegador
      const dataUrl = `data:application/pdf;base64,${pdfBase64}`;
      console.log('🔗 URL de visualização criada:', dataUrl.substring(0, 50) + '...');
      
      // Converter base64 para blob para download
      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Criar link de download
      const a = document.createElement('a');
      a.href = url;
      a.download = `danfe_${result.danfeNumber}_${result.accessKey}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Etapa 6: PDF exportado e disponibilizado para download');
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O arquivo PDF do DANFE foi baixado com todas as informações.",
      });
    } catch (error) {
      console.error('❌ Erro completo no fluxo:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: error instanceof Error ? error.message : "Erro desconhecido ao gerar PDF",
        variant: "destructive"
      });
    }
  };

  // Função melhorada para exportar XML com todas as informações REAIS
  const handleExportXML = (result: any) => {
    try {
      console.log('📄 Iniciando exportação de XML com todas as informações REAIS...');
      
      // Validar se o XML contém todas as informações necessárias
      if (!validateXmlContent(result.xmlContent)) {
        toast({
          title: "XML incompleto",
          description: "O XML não contém todas as informações necessárias.",
          variant: "destructive"
        });
        return;
      }
      
      // Criar blob com o conteúdo XML completo
      const blob = new Blob([result.xmlContent], { 
        type: 'application/xml;charset=utf-8' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Nome do arquivo mais descritivo incluindo dados REAIS
      const fileName = `NFe_${result.danfeNumber}_${result.accessKey}_${result.supplier.replace(/[^a-zA-Z0-9]/g, '_')}.xml`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ XML exportado com sucesso com dados REAIS:', fileName);
      
      toast({
        title: "Exportação XML concluída",
        description: `Arquivo ${fileName} baixado com todas as informações REAIS da NFe.`,
      });
    } catch (error) {
      console.error('❌ Erro ao exportar XML:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o arquivo XML.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDanfe = (accessKey: string) => {
    const updatedSaved = savedResults.filter(result => result.accessKey !== accessKey);
    setSavedResults(updatedSaved);
    localStorage.setItem('savedDanfeResults', JSON.stringify(updatedSaved));
    
    toast({
      title: "DANFE excluído",
      description: "O DANFE foi removido da lista salva.",
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

      {/* Tabela de DANFEs Salvos */}
      {savedResults.length > 0 && (
        <Card className="border-t-4 border-t-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-green-600" />
              DANFEs Salvos ({savedResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DANFE</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.danfeNumber}</TableCell>
                      <TableCell>{result.supplier}</TableCell>
                      <TableCell>{formatDate(result.issueDate)}</TableCell>
                      <TableCell>{formatCurrency(result.totalValue)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleExportPDF(result)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </Button>
                          <Button
                            onClick={() => handleExportXML(result)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            XML
                          </Button>
                          <Button
                            onClick={() => handleDeleteDanfe(result.accessKey)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
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
