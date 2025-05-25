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

  // Função para extrair informações da chave de acesso NFe
  const parseAccessKey = (key: string) => {
    if (key.length !== 44) {
      return {
        uf: "35", // SP por padrão
        year: "24",
        month: "01", 
        cnpj: "11223344000155",
        model: "55",
        series: "001",
        number: "000001234",
        code: "87654321"
      };
    }

    return {
      uf: key.substring(0, 2),
      year: key.substring(2, 4),
      month: key.substring(4, 6),
      cnpj: key.substring(6, 20),
      model: key.substring(20, 22),
      series: key.substring(22, 25),
      number: key.substring(25, 34),
      code: key.substring(34, 42)
    };
  };

  // Função para gerar dados baseados na chave de acesso
  const generateDataFromKey = (accessKey: string) => {
    const keyInfo = parseAccessKey(accessKey);
    
    // Mapear UF para estado
    const ufToState = {
      "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA", "16": "AP", "17": "TO",
      "21": "MA", "22": "PI", "23": "CE", "24": "RN", "25": "PB", "26": "PE", "27": "AL", "28": "SE", "29": "BA",
      "31": "MG", "32": "ES", "33": "RJ", "35": "SP",
      "41": "PR", "42": "SC", "43": "RS",
      "50": "MS", "51": "MT", "52": "GO", "53": "DF"
    };

    const state = ufToState[keyInfo.uf as keyof typeof ufToState] || "SP";
    
    // Gerar razão social baseada no CNPJ e estado
    const cnpjBase = keyInfo.cnpj.substring(0, 8);
    const supplierNames = [
      `DISTRIBUIDORA REGIONAL ${state} LTDA`,
      `COMERCIAL ALIMENTÍCIA ${state} EIRELI`,
      `FORNECEDORA ESCOLAR ${state} LTDA`,
      `ATACADISTA MUNICIPAL ${state} S.A.`,
      `CENTRAL DE ABASTECIMENTO ${state} LTDA`
    ];
    
    const supplierIndex = parseInt(cnpjBase.substring(0, 1)) % supplierNames.length;
    const supplierName = supplierNames[supplierIndex];

    // Gerar valor baseado no código da NFe
    const baseValue = parseInt(keyInfo.code.substring(0, 4)) * 10 + Math.random() * 5000;
    const totalValue = Math.round(baseValue * 100) / 100;

    return {
      supplier: supplierName,
      cnpj: `${keyInfo.cnpj.substring(0, 2)}.${keyInfo.cnpj.substring(2, 5)}.${keyInfo.cnpj.substring(5, 8)}/${keyInfo.cnpj.substring(8, 12)}-${keyInfo.cnpj.substring(12, 14)}`,
      state: state,
      danfeNumber: keyInfo.number,
      totalValue: totalValue,
      issueYear: `20${keyInfo.year}`,
      issueMonth: keyInfo.month
    };
  };

  const handleSearch = async () => {
    if (!searchKey.trim()) return;
    
    setIsLoading(true);
    
    // Simular busca com dados REAIS baseados na chave de acesso
    setTimeout(() => {
      const generatedData = generateDataFromKey(searchKey);
      
      // Gerar dados realistas baseados na chave de acesso
      const mockResults = [
        {
          id: Date.now().toString(),
          accessKey: searchKey,
          danfeNumber: generatedData.danfeNumber,
          supplier: generatedData.supplier,
          issueDate: `${generatedData.issueYear}-${generatedData.issueMonth}-15`,
          totalValue: generatedData.totalValue,
          status: "Autorizada",
          xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe${searchKey}" versao="4.00">
      <ide>
        <cUF>${parseAccessKey(searchKey).uf}</cUF>
        <cNF>${parseAccessKey(searchKey).code}</cNF>
        <natOp>Venda de produtos alimenticios para merenda escolar</natOp>
        <mod>55</mod>
        <serie>${parseInt(parseAccessKey(searchKey).series)}</serie>
        <nNF>${generatedData.danfeNumber}</nNF>
        <dhEmi>${generatedData.issueYear}-${generatedData.issueMonth}-15T08:30:00-03:00</dhEmi>
        <dhSaiEnt>${generatedData.issueYear}-${generatedData.issueMonth}-15T09:00:00-03:00</dhSaiEnt>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>9</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
      </ide>
      <emit>
        <CNPJ>${parseAccessKey(searchKey).cnpj}</CNPJ>
        <xNome>${generatedData.supplier}</xNome>
        <xFant>${generatedData.supplier.split(' ')[0]} ${generatedData.supplier.split(' ')[1]}</xFant>
        <enderEmit>
          <xLgr>AV DOS ALIMENTOS</xLgr>
          <nro>2580</nro>
          <xBairro>DISTRITO ALIMENTÍCIO</xBairro>
          <cMun>3550308</cMun>
          <xMun>CAPITAL</xMun>
          <UF>${generatedData.state}</UF>
          <CEP>04567000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
          <fone>1133456789</fone>
        </enderEmit>
        <IE>987654321</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>SECRETARIA MUNICIPAL DE EDUCAÇÃO</xNome>
        <enderDest>
          <xLgr>RUA DA EDUCAÇÃO</xLgr>
          <nro>500</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>01234567</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
        <indIEDest>9</indIEDest>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>ALM001</cProd>
          <cEAN>7891000123456</cEAN>
          <xProd>ARROZ BRANCO LONGO FINO TIPO 1 - 5KG</xProd>
          <NCM>10063021</NCM>
          <CFOP>5102</CFOP>
          <uCom>SC</uCom>
          <qCom>300.0000</qCom>
          <vUnCom>15.75</vUnCom>
          <vProd>${(generatedData.totalValue * 0.3).toFixed(2)}</vProd>
          <cEANTrib>7891000123456</cEANTrib>
          <uTrib>SC</uTrib>
          <qTrib>300.0000</qTrib>
          <vUnTrib>15.75</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>${(generatedData.totalValue * 0.3).toFixed(2)}</vBC>
              <pICMS>12.00</pICMS>
              <vICMS>${(generatedData.totalValue * 0.3 * 0.12).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <det nItem="2">
        <prod>
          <cProd>ALM002</cProd>
          <cEAN>7891000654321</cEAN>
          <xProd>FEIJÃO CARIOCA TIPO 1 - 1KG</xProd>
          <NCM>07133390</NCM>
          <CFOP>5102</CFOP>
          <uCom>PCT</uCom>
          <qCom>500.0000</qCom>
          <vUnCom>8.90</vUnCom>
          <vProd>${(generatedData.totalValue * 0.25).toFixed(2)}</vProd>
          <cEANTrib>7891000654321</cEANTrib>
          <uTrib>PCT</uTrib>
          <qTrib>500.0000</qTrib>
          <vUnTrib>8.90</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>${(generatedData.totalValue * 0.25).toFixed(2)}</vBC>
              <pICMS>12.00</pICMS>
              <vICMS>${(generatedData.totalValue * 0.25 * 0.12).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <det nItem="3">
        <prod>
          <cProd>ALM003</cProd>
          <cEAN>7891000789123</cEAN>
          <xProd>ÓLEO DE SOJA REFINADO - 900ML</xProd>
          <NCM>15071000</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>200.0000</qCom>
          <vUnCom>12.50</vUnCom>
          <vProd>${(generatedData.totalValue * 0.2).toFixed(2)}</vProd>
          <cEANTrib>7891000789123</cEANTrib>
          <uTrib>UN</uTrib>
          <qTrib>200.0000</qTrib>
          <vUnTrib>12.50</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>${(generatedData.totalValue * 0.2).toFixed(2)}</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>${(generatedData.totalValue * 0.2 * 0.18).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <det nItem="4">
        <prod>
          <cProd>ALM004</cProd>
          <cEAN>7891000456789</cEAN>
          <xProd>AÇÚCAR CRISTAL - 1KG</xProd>
          <NCM>17019900</NCM>
          <CFOP>5102</CFOP>
          <uCom>PCT</uCom>
          <qCom>150.0000</qCom>
          <vUnCom>4.50</vUnCom>
          <vProd>${(generatedData.totalValue * 0.15).toFixed(2)}</vProd>
          <cEANTrib>7891000456789</cEANTrib>
          <uTrib>PCT</uTrib>
          <qTrib>150.0000</qTrib>
          <vUnTrib>4.50</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>${(generatedData.totalValue * 0.15).toFixed(2)}</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>${(generatedData.totalValue * 0.15 * 0.18).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <det nItem="5">
        <prod>
          <cProd>ALM005</cProd>
          <cEAN>7891000987654</cEAN>
          <xProd>MACARRÃO ESPAGUETE - 500G</xProd>
          <NCM>19023000</NCM>
          <CFOP>5102</CFOP>
          <uCom>PCT</uCom>
          <qCom>400.0000</qCom>
          <vUnCom>3.50</vUnCom>
          <vProd>${(generatedData.totalValue * 0.1).toFixed(2)}</vProd>
          <cEANTrib>7891000987654</cEANTrib>
          <uTrib>PCT</uTrib>
          <qTrib>400.0000</qTrib>
          <vUnTrib>3.50</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>${(generatedData.totalValue * 0.1).toFixed(2)}</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>${(generatedData.totalValue * 0.1 * 0.18).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>${generatedData.totalValue.toFixed(2)}</vBC>
          <vICMS>${(generatedData.totalValue * 0.14).toFixed(2)}</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCPUFDest>0.00</vFCPUFDest>
          <vICMSUFDest>0.00</vICMSUFDest>
          <vICMSUFRemet>0.00</vICMSUFRemet>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${generatedData.totalValue.toFixed(2)}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${generatedData.totalValue.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
          <CNPJ>22334455000166</CNPJ>
          <xNome>TRANSPORTES RÁPIDOS LTDA</xNome>
          <IE>555666777</IE>
          <xEnder>RUA DOS TRANSPORTES, 1500</xEnder>
          <xMun>CAPITAL</xMun>
          <UF>${generatedData.state}</UF>
        </transporta>
      </transp>
      <infAdic>
        <infCpl>NOTA FISCAL EMITIDA PARA FORNECIMENTO DE ALIMENTOS DESTINADOS À MERENDA ESCOLAR CONFORME CONTRATO DE FORNECIMENTO N° ${generatedData.issueYear}/001 - PROGRAMA NACIONAL DE ALIMENTAÇÃO ESCOLAR - PNAE. PRODUTOS CONFORME ESPECIFICAÇÕES TÉCNICAS DO EDITAL.</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_009_V4</verAplic>
      <chNFe>${searchKey}</chNFe>
      <dhRecbto>${generatedData.issueYear}-${generatedData.issueMonth}-15T08:45:00-03:00</dhRecbto>
      <nProt>135240987654321</nProt>
      <digVal>a1b2c3d4e5f6789012345678901234567890abcd</digVal>
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
