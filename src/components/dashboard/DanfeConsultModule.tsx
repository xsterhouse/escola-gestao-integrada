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

  const handleSearch = async () => {
    if (!searchKey.trim()) return;
    
    setIsLoading(true);
    
    // Simulate search - in a real implementation, this would call an API
    setTimeout(() => {
      // Mock search results based on the access key
      const mockResults = [
        {
          id: Date.now().toString(),
          accessKey: searchKey,
          danfeNumber: "000001234",
          supplier: "Fornecedor Exemplo LTDA",
          issueDate: "2024-01-15",
          totalValue: 2500.00,
          status: "Autorizada",
          xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe${searchKey}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>12345678</cNF>
        <natOp>Venda de produtos</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>1234</nNF>
        <dhEmi>2024-01-15T10:00:00-03:00</dhEmi>
        <dhSaiEnt>2024-01-15T10:30:00-03:00</dhSaiEnt>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>5</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
      </ide>
      <emit>
        <CNPJ>12345678000123</CNPJ>
        <xNome>Fornecedor Exemplo LTDA</xNome>
        <xFant>Fornecedor Exemplo</xFant>
        <enderEmit>
          <xLgr>Rua das Empresas, 123</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01000000</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
          <fone>1133334444</fone>
        </enderEmit>
        <IE>123456789</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>98765432000111</CNPJ>
        <xNome>Cliente Exemplo LTDA</xNome>
        <enderDest>
          <xLgr>Avenida dos Clientes, 456</xLgr>
          <nro>456</nro>
          <xBairro>Jardim Exemplo</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>02000000</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>987654321</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>Produto Exemplo 1</xProd>
          <NCM>12345678</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>10.0000</qCom>
          <vUnCom>50.0000</vUnCom>
          <vProd>500.00</vProd>
          <cEANTrib>7891234567890</cEANTrib>
          <uTrib>UN</uTrib>
          <qTrib>10.0000</qTrib>
          <vUnTrib>50.0000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>500.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>90.00</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <det nItem="2">
        <prod>
          <cProd>002</cProd>
          <cEAN>7891234567891</cEAN>
          <xProd>Produto Exemplo 2</xProd>
          <NCM>87654321</NCM>
          <CFOP>5102</CFOP>
          <uCom>KG</uCom>
          <qCom>5.0000</qCom>
          <vUnCom>400.0000</vUnCom>
          <vProd>2000.00</vProd>
          <cEANTrib>7891234567891</cEANTrib>
          <uTrib>KG</uTrib>
          <qTrib>5.0000</qTrib>
          <vUnTrib>400.0000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>2000.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>360.00</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>2500.00</vBC>
          <vICMS>450.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCPUFDest>0.00</vFCPUFDest>
          <vICMSUFDest>0.00</vICMSUFDest>
          <vICMSUFRemet>0.00</vICMSUFRemet>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>2500.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>2500.00</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
          <CNPJ>11111111000111</CNPJ>
          <xNome>Transportadora Exemplo LTDA</xNome>
          <IE>111111111</IE>
          <xEnder>Rua das Transportadoras, 789</xEnder>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
        </transporta>
      </transp>
      <infAdic>
        <infCpl>Informações complementares da nota fiscal de exemplo.</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_009_V4</verAplic>
      <chNFe>${searchKey}</chNFe>
      <dhRecbto>2024-01-15T10:15:00-03:00</dhRecbto>
      <nProt>135240001234567</nProt>
      <digVal>abcd1234efgh5678ijkl9012mnop3456qrst7890</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`,
          pdfBase64: null
        }
      ];
      
      setSearchResults(mockResults);
      
      // Salvar automaticamente no localStorage
      const existingSaved = JSON.parse(localStorage.getItem('savedDanfeResults') || '[]');
      const newSaved = [...existingSaved, ...mockResults.filter(result => 
        !existingSaved.some((saved: any) => saved.accessKey === result.accessKey)
      )];
      
      localStorage.setItem('savedDanfeResults', JSON.stringify(newSaved));
      setSavedResults(newSaved);
      
      setIsLoading(false);
    }, 1500);
  };

  const generatePdfFromXml = async (xmlContent: string): Promise<string> => {
    try {
      console.log('Iniciando geração de PDF do XML com nova API...');
      
      const response = await fetch('https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: xmlContent
      });

      if (response.status === 200) {
        let pdfBase64 = await response.text();
        
        // Remove aspas duplas se estiverem presentes na resposta
        if (pdfBase64.startsWith('"') && pdfBase64.endsWith('"')) {
          pdfBase64 = pdfBase64.slice(1, -1);
        }
        
        console.log('PDF gerado com sucesso via API');
        return pdfBase64;
      } else if (response.status === 500) {
        throw new Error('Falha ao gerar PDF do DANFE! Confira o seu XML');
      } else {
        throw new Error(`Erro na API: Status ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro desconhecido ao gerar PDF');
    }
  };

  const handleExportPDF = async (result: any) => {
    try {
      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto o PDF do DANFE está sendo gerado...",
      });

      // Gera o PDF usando a nova API
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
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: error instanceof Error ? error.message : "Erro desconhecido ao gerar PDF",
        variant: "destructive"
      });
    }
  };

  const handleExportXML = (result: any) => {
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
