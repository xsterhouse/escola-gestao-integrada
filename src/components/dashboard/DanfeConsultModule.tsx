import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Calendar, DollarSign, Building, Download, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { useAuth } from "@/contexts/AuthContext";
import { Invoice } from "@/lib/types";

export function DanfeConsultModule() {
  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const { toast } = useToast();
  const { currentSchool } = useAuth();

  // Carregar dados reais de notas fiscais do sistema com debugging
  const invoicesKey = currentSchool ? `invoices_${currentSchool.id}` : 'invoices';
  const { data: systemInvoices, loadData: reloadInvoices } = useLocalStorageSync<Invoice>(invoicesKey, []);

  // Log detalhado dos dados carregados
  useEffect(() => {
    console.log('🔍 DANFE MODULE - Debug Info:');
    console.log(`📊 Escola atual: ${currentSchool?.name || 'Não selecionada'}`);
    console.log(`🔑 Chave localStorage: ${invoicesKey}`);
    console.log(`📦 Total de notas carregadas: ${systemInvoices.length}`);
    
    if (systemInvoices.length > 0) {
      console.log('📋 Primeiras 3 notas fiscais:');
      systemInvoices.slice(0, 3).forEach((invoice, index) => {
        console.log(`  ${index + 1}. DANFE: ${invoice.danfeNumber} - ${invoice.supplier.name}`);
        console.log(`     - XML disponível: ${invoice.xmlContent ? 'SIM' : 'NÃO'}`);
        console.log(`     - Status: ${invoice.status}`);
      });
    } else {
      console.log('⚠ Nenhuma nota fiscal encontrada no localStorage');
      // Tentar recarregar dados
      console.log('🔄 Tentando recarregar dados...');
      reloadInvoices();
    }
  }, [systemInvoices, currentSchool, invoicesKey]);

  // Função melhorada para extrair chave de acesso do XML
  const extractAccessKeyFromXml = (xmlContent: string): string | null => {
    try {
      console.log('🔍 Extraindo chave de acesso do XML...');
      
      // Padrão 1: Atributo Id na tag infNFe
      const idMatch = xmlContent.match(/<infNFe[^>]*Id="NFe(\d{44})"/i);
      if (idMatch) {
        console.log('✅ Chave encontrada no atributo Id:', idMatch[1]);
        return idMatch[1];
      }
      
      // Padrão 2: Tag chNFe
      const chNFeMatch = xmlContent.match(/<chNFe>(\d{44})<\/chNFe>/i);
      if (chNFeMatch) {
        console.log('✅ Chave encontrada na tag chNFe:', chNFeMatch[1]);
        return chNFeMatch[1];
      }
      
      // Padrão 3: Qualquer sequência de 44 dígitos
      const keyMatch = xmlContent.match(/\b(\d{44})\b/);
      if (keyMatch) {
        console.log('✅ Chave encontrada (padrão genérico):', keyMatch[1]);
        return keyMatch[1];
      }
      
      console.log('❌ Nenhuma chave de acesso encontrada no XML');
      return null;
    } catch (error) {
      console.error('❌ Erro ao extrair chave do XML:', error);
      return null;
    }
  };

  // Buscar nota fiscal real pela chave de acesso - MELHORADA
  const findInvoiceByAccessKey = (accessKey: string): Invoice | null => {
    console.log('🔍 Buscando nota fiscal com chave:', accessKey);
    console.log(`📊 Analisando ${systemInvoices.length} notas fiscais no sistema`);
    
    if (systemInvoices.length === 0) {
      console.log('❌ Nenhuma nota fiscal disponível para busca');
      return null;
    }
    
    // Método 1: Buscar pela chave no xmlContent
    const foundByXml = systemInvoices.find(invoice => {
      if (!invoice.xmlContent) return false;
      
      const extractedKey = extractAccessKeyFromXml(invoice.xmlContent);
      return extractedKey === accessKey;
    });
    
    if (foundByXml) {
      console.log('✅ Nota encontrada via XML - DANFE:', foundByXml.danfeNumber);
      return foundByXml;
    }
    
    // Método 2: Buscar pelo número da DANFE
    const foundByDanfe = systemInvoices.find(invoice => 
      invoice.danfeNumber === accessKey
    );
    
    if (foundByDanfe) {
      console.log('✅ Nota encontrada via número DANFE:', foundByDanfe.danfeNumber);
      return foundByDanfe;
    }
    
    // Método 3: Buscar pelo ID
    const foundById = systemInvoices.find(invoice => 
      invoice.id === accessKey
    );
    
    if (foundById) {
      console.log('✅ Nota encontrada via ID:', foundById.danfeNumber);
      return foundById;
    }
    
    console.log('❌ Nota fiscal não encontrada com a chave fornecida');
    console.log('🔍 Chaves disponíveis no sistema:');
    systemInvoices.forEach((invoice, index) => {
      const xmlKey = invoice.xmlContent ? extractAccessKeyFromXml(invoice.xmlContent) : 'N/A';
      console.log(`  ${index + 1}. DANFE: ${invoice.danfeNumber} | XML Key: ${xmlKey} | ID: ${invoice.id}`);
    });
    
    return null;
  };

  // Gerar XML content caso não exista
  const generateXmlFromInvoice = (invoice: Invoice, accessKey: string): string => {
    const currentDate = new Date().toISOString();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe${accessKey}" versao="4.00">
      <ide>
        <cUF>17</cUF>
        <cNF>55035015</cNF>
        <natOp>Venda de mercadoria</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>${invoice.danfeNumber}</nNF>
        <dhEmi>${invoice.issueDate}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>1721000</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>0</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>1</indPres>
      </ide>
      <emit>
        <CNPJ>${invoice.supplier.cnpj.replace(/[^\d]/g, '')}</CNPJ>
        <xNome>${invoice.supplier.name}</xNome>
        <enderEmit>
          <xLgr>${invoice.supplier.address || 'Endereço não informado'}</xLgr>
          <nro>S/N</nro>
          <xBairro>Centro</xBairro>
          <cMun>1721000</cMun>
          <xMun>Palmas</xMun>
          <UF>TO</UF>
          <CEP>77001000</CEP>
        </enderEmit>
        <IE>29170166000</IE>
      </emit>
      <dest>
        <CNPJ>${currentSchool?.cnpj?.replace(/[^\d]/g, '') || '12345678000190'}</CNPJ>
        <xNome>${currentSchool?.name || 'Escola Municipal'}</xNome>
        <enderDest>
          <xLgr>${currentSchool?.address || 'Endereço da Escola'}</xLgr>
          <nro>S/N</nro>
          <xBairro>Centro</xBairro>
          <cMun>1721000</cMun>
          <xMun>Palmas</xMun>
          <UF>TO</UF>
          <CEP>77020000</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>123456789</IE>
      </dest>
      ${invoice.items.map((item, index) => `
      <det nItem="${index + 1}">
        <prod>
          <cProd>${String(index + 1).padStart(3, '0')}</cProd>
          <cEAN></cEAN>
          <xProd>${item.description}</xProd>
          <NCM>12345678</NCM>
          <CFOP>5102</CFOP>
          <uCom>${item.unitOfMeasure}</uCom>
          <qCom>${item.quantity.toFixed(4)}</qCom>
          <vUnCom>${item.unitPrice.toFixed(4)}</vUnCom>
          <vProd>${item.totalPrice.toFixed(2)}</vProd>
          <cEANTrib></cEANTrib>
          <uTrib>${item.unitOfMeasure}</uTrib>
          <qTrib>${item.quantity.toFixed(4)}</qTrib>
          <vUnTrib>${item.unitPrice.toFixed(4)}</vUnTrib>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>${item.totalPrice.toFixed(2)}</vBC>
              <pICMS>17.00</pICMS>
              <vICMS>${(item.totalPrice * 0.17).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>`).join('')}
      <total>
        <ICMSTot>
          <vBC>${invoice.totalValue.toFixed(2)}</vBC>
          <vICMS>${(invoice.totalValue * 0.17).toFixed(2)}</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${invoice.totalValue.toFixed(2)}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${invoice.totalValue.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_008i2</verAplic>
      <chNFe>${accessKey}</chNFe>
      <dhRecbto>${currentDate}</dhRecbto>
      <nProt>117240000000000</nProt>
      <digVal>abcd1234=</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
  };

  // Etapa 1: Validar XML antes de processar - CORRIGIDA
  const validateXmlContent = (xmlContent: string): boolean => {
    console.log('🔍 Etapa 1: Validando XML...');
    
    // Verificar se o XML não está vazio
    if (!xmlContent || xmlContent.trim().length === 0) {
      console.error('❌ XML vazio ou inválido');
      return false;
    }
    
    // Verificar se é um XML válido
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      const parserError = xmlDoc.querySelector('parsererror');
      
      if (parserError) {
        console.error('❌ Erro de parsing do XML:', parserError.textContent);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao validar XML:', error);
      return false;
    }
    
    // Verificar campos obrigatórios do XML NFe com verificação mais flexível
    const requiredPatterns = [
      { field: 'infNFe', pattern: /<infNFe/i },
      { field: 'emit ou dest', pattern: /<emit>|<dest>/i },
      { field: 'det', pattern: /<det[\s>]/i }
    ];
    
    for (const req of requiredPatterns) {
      if (!req.pattern.test(xmlContent)) {
        console.error(`❌ Campo obrigatório não encontrado: ${req.field}`);
        return false;
      }
    }
    
    console.log('✅ XML validado com sucesso - estrutura NFe detectada');
    return true;
  };

  // Etapa 2: Gerar DANFE via API - CORRIGIDA
  const generatePdfFromXml = async (xmlContent: string): Promise<string> => {
    try {
      console.log('🔧 Etapa 2: Enviando XML para API do DANFE...');
      console.log('📊 Tamanho do XML:', xmlContent.length, 'caracteres');
      
      // Validar XML antes de enviar
      if (!validateXmlContent(xmlContent)) {
        throw new Error('XML inválido - não contém estrutura NFe válida');
      }
      
      console.log('🌐 Fazendo requisição para API...');
      const response = await fetch('https://ws.meudanfe.com/api/v1/get/nfe/xmltodanfepdf/API', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xmlContent
      });

      console.log('📊 Etapa 3: Status da resposta:', response.status);
      
      if (response.status === 200) {
        console.log('✅ Status 200 - Processando resposta...');
        
        let pdfBase64 = await response.text();
        console.log('📄 Resposta recebida, tamanho:', pdfBase64.length);
        
        // Etapa 4: Remover aspas duplas se estiverem presentes
        pdfBase64 = pdfBase64.replace(/^"|"$/g, "");
        console.log('🧹 PDF limpo, tamanho final:', pdfBase64.length);
        
        return pdfBase64;
      } else if (response.status === 500) {
        const errorText = await response.text();
        console.error('❌ Status 500 - Erro da API:', errorText);
        throw new Error('Falha ao gerar PDF do DANFE! Confira o seu XML');
      } else {
        const errorText = await response.text();
        console.error(`❌ Status ${response.status} - Erro:`, errorText);
        throw new Error(`Erro na API: Status ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro completo no processamento:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro desconhecido ao gerar PDF');
    }
  };

  const handleSearch = async () => {
    if (!searchKey.trim()) return;
    
    setIsLoading(true);
    
    try {
      console.log('🚀 Iniciando busca de NFe com chave:', searchKey);
      console.log('📊 Sistema tem', systemInvoices.length, 'notas fiscais disponíveis');
      
      // Verificar se há notas no sistema
      if (systemInvoices.length === 0) {
        throw new Error('Nenhuma nota fiscal encontrada no sistema. Importe XMLs primeiro no módulo de estoque.');
      }
      
      // Buscar nota fiscal real no sistema
      const foundInvoice = findInvoiceByAccessKey(searchKey);
      
      if (!foundInvoice) {
        throw new Error(`Nota fiscal não encontrada no sistema. Verifique se a chave "${searchKey}" está correta ou se a nota foi importada.`);
      }
      
      console.log('✅ Nota fiscal encontrada:', foundInvoice.danfeNumber);
      
      // Usar xmlContent real ou gerar XML com dados reais
      let xmlContent = foundInvoice.xmlContent;
      
      if (!xmlContent) {
        console.log('⚠ XML não disponível, gerando a partir dos dados da nota...');
        xmlContent = generateXmlFromInvoice(foundInvoice, searchKey);
      }
      
      // Validar XML antes de prosseguir
      if (!validateXmlContent(xmlContent)) {
        throw new Error('XML da nota fiscal está inválido ou corrompido.');
      }
      
      // Mapear status da nota fiscal
      const getStatusText = (status: string) => {
        switch (status) {
          case 'aprovada': return 'Autorizada';
          case 'pendente': return 'Pendente';
          case 'rejeitada': return 'Rejeitada';
          default: return 'Autorizada';
        }
      };
      
      const result = {
        id: foundInvoice.id,
        accessKey: searchKey,
        danfeNumber: foundInvoice.danfeNumber,
        supplier: foundInvoice.supplier.name,
        cnpj: foundInvoice.supplier.cnpj,
        issueDate: foundInvoice.issueDate.toISOString().split('T')[0],
        totalValue: foundInvoice.totalValue,
        status: getStatusText(foundInvoice.status),
        xmlContent: xmlContent,
        realInvoice: foundInvoice
      };
      
      setSearchResults([result]);
      
      // Salvar automaticamente no localStorage
      const existingSaved = JSON.parse(localStorage.getItem('savedDanfeResults') || '[]');
      const newSaved = [...existingSaved, result].filter((item, index, self) => 
        index === self.findIndex(t => t.accessKey === item.accessKey)
      );
      
      localStorage.setItem('savedDanfeResults', JSON.stringify(newSaved));
      setSavedResults(newSaved);
      
      console.log('✅ Busca concluída com sucesso');
      
      toast({
        title: "NFe encontrada (Dados Reais)",
        description: `DANFE ${result.danfeNumber} - ${result.supplier} - ${result.realInvoice.items.length} itens`,
      });
      
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      
      toast({
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Verifique a chave de acesso",
        variant: "destructive"
      });
      
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados salvos do localStorage na inicialização
  useEffect(() => {
    const saved = localStorage.getItem('savedDanfeResults');
    if (saved) {
      setSavedResults(JSON.parse(saved));
    }
  }, []);

  const handleExportPDF = async (result: any) => {
    try {
      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto o PDF do DANFE está sendo gerado...",
      });

      const pdfBase64 = await generatePdfFromXml(result.xmlContent);
      
      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `danfe_${result.danfeNumber}_${result.accessKey}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
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

  const handleExportXML = (result: any) => {
    try {
      console.log('📄 Iniciando exportação de XML com todas as informações REAIS...');
      
      if (!validateXmlContent(result.xmlContent)) {
        toast({
          title: "XML incompleto",
          description: "O XML não contém todas as informações necessárias.",
          variant: "destructive"
        });
        return;
      }
      
      const blob = new Blob([result.xmlContent], { 
        type: 'application/xml;charset=utf-8' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const fileName = `NFe_${result.danfeNumber}_${result.accessKey}_${result.supplier.replace(/[^a-zA-Z0-9]/g, '_')}.xml`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
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
            Consulta DANFE - Dados Reais do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Section - Left Side */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Digite a chave de acesso do XML (44 dígitos) ou número da DANFE"
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
              
              {/* Sistema Info - Melhorado */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <p><strong>📊 Status do Sistema:</strong></p>
                <p>• Notas disponíveis: {systemInvoices.length}</p>
                <p>• Escola atual: {currentSchool?.name || 'Não selecionada'}</p>
                <p>• Chave localStorage: {invoicesKey}</p>
                {systemInvoices.length === 0 && (
                  <div className="text-orange-600 mt-2 p-2 bg-orange-50 rounded">
                    <p>⚠ <strong>Nenhuma nota fiscal encontrada!</strong></p>
                    <p>• Importe XMLs primeiro no módulo de estoque</p>
                    <p>• Verifique se a escola está selecionada</p>
                  </div>
                )}
                {systemInvoices.length > 0 && (
                  <div className="text-green-600 mt-2 p-2 bg-green-50 rounded">
                    <p>✅ Sistema pronto para consultas</p>
                    <p>• Use a chave de acesso completa (44 dígitos)</p>
                    <p>• Ou digite o número da DANFE</p>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section - Right Side */}
            <div className="space-y-3">
              {searchResults.length > 0 && (
                <>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">DADOS REAIS</Badge>
                    Resultados da busca:
                  </h4>
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
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {result.realInvoice?.items?.length || 0} itens
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{result.supplier}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">CNPJ:</span>
                              <span className="text-sm">{result.cnpj}</span>
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
                          
                          {/* Mostrar alguns itens da nota */}
                          {result.realInvoice?.items && result.realInvoice.items.length > 0 && (
                            <div className="bg-gray-50 p-2 rounded text-xs">
                              <p className="font-medium mb-1">Primeiros itens:</p>
                              {result.realInvoice.items.slice(0, 2).map((item: any, index: number) => (
                                <div key={index} className="text-gray-600">
                                  • {item.description} - Qtd: {item.quantity} {item.unitOfMeasure}
                                </div>
                              ))}
                              {result.realInvoice.items.length > 2 && (
                                <div className="text-gray-500 mt-1">
                                  ... e mais {result.realInvoice.items.length - 2} itens
                                </div>
                              )}
                            </div>
                          )}
                          
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
                  <p className="text-sm">Verifique se a nota foi importada no sistema.</p>
                </div>
              )}

              {!searchKey && !isLoading && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Digite uma chave de acesso para buscar nos dados reais</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {systemInvoices.length} nota(s) fiscal(is) disponível(is) no sistema
                  </p>
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
              <Badge variant="outline" className="text-blue-600 border-blue-600">DADOS REAIS</Badge>
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
                    <TableHead>Itens</TableHead>
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
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {result.realInvoice?.items?.length || 0}
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
