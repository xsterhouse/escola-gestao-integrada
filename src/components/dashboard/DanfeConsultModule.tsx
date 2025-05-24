
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Eye, Loader2 } from "lucide-react";

export function DanfeConsultModule() {
  const [xmlContent, setXmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [danfeData, setDanfeData] = useState<{
    pdfBase64: string;
    cnpjEmissor?: string;
    chaveNfe?: string;
    dataEmissao?: string;
  } | null>(null);
  const { toast } = useToast();

  const handleConsultDanfe = async () => {
    if (!xmlContent.trim()) {
      toast({
        title: "XML obrigatório",
        description: "Por favor, cole o código XML da NFe antes de consultar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("https://meudanfe.com.br/api/gerar-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/xml",
        },
        body: xmlContent,
      });

      if (response.status === 200) {
        const base64Content = await response.text();
        
        // Extrair dados básicos do XML (simulado)
        const mockData = {
          cnpjEmissor: "12.345.678/0001-99",
          chaveNfe: "12345678901234567890123456789012345678901234",
          dataEmissao: new Date().toLocaleDateString('pt-BR'),
        };

        setDanfeData({
          pdfBase64: base64Content,
          ...mockData,
        });

        toast({
          title: "DANFE gerado com sucesso",
          description: "O DANFE foi processado e está pronto para visualização.",
        });
      } else if (response.status === 500) {
        toast({
          title: "Falha ao gerar o DANFE!",
          description: "Confira o XML informado.",
          variant: "destructive",
        });
      } else {
        throw new Error(`Status ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao consultar DANFE:", error);
      toast({
        title: "Erro na consulta",
        description: "Ocorreu um erro ao processar a solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDanfe = () => {
    if (danfeData?.pdfBase64) {
      const pdfWindow = window.open();
      if (pdfWindow) {
        pdfWindow.document.write(`
          <iframe 
            src="data:application/pdf;base64,${danfeData.pdfBase64}" 
            style="width:100%; height:100%; border:none;"
            title="DANFE">
          </iframe>
        `);
      }
    }
  };

  const handleDownloadPdf = () => {
    if (danfeData?.pdfBase64) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${danfeData.pdfBase64}`;
      link.download = `danfe_${danfeData.chaveNfe || 'documento'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-t-4 border-t-[#012340]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Consulta DANFE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Cole o XML da NFe:
            </label>
            <Textarea
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
              placeholder="Cole aqui o código XML completo da Nota Fiscal Eletrônica..."
              className="min-h-[120px] resize-none"
            />
          </div>
          
          <Button 
            onClick={handleConsultDanfe}
            disabled={isLoading || !xmlContent.trim()}
            className="w-full bg-[#012340] hover:bg-[#012340]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              "Consultar Nota e Gerar DANFE"
            )}
          </Button>

          {danfeData && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 font-medium">DANFE processado com sucesso!</p>
                {danfeData.cnpjEmissor && (
                  <div className="mt-2 space-y-1 text-xs text-green-700">
                    <p><strong>CNPJ Emissor:</strong> {danfeData.cnpjEmissor}</p>
                    <p><strong>Chave NFe:</strong> {danfeData.chaveNfe}</p>
                    <p><strong>Data Emissão:</strong> {danfeData.dataEmissao}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewDanfe}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar DANFE
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadPdf}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-[#012340]">
        <CardHeader>
          <CardTitle className="text-lg">Como usar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="bg-[#012340] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <p>Cole o código XML completo da Nota Fiscal Eletrônica no campo ao lado.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-[#012340] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <p>Clique em "Consultar Nota e Gerar DANFE" para processar o XML.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-[#012340] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <p>Após o processamento, você poderá visualizar ou baixar o DANFE em PDF.</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Dica:</strong> O XML deve ser o código completo da NFe, incluindo todas as tags XML necessárias.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
