
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, DollarSign, Building } from "lucide-react";

export function DanfeConsultModule() {
  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
          status: "Autorizada"
        }
      ];
      
      setSearchResults(mockResults);
      setIsLoading(false);
    }, 1500);
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

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Resultados da busca:</h4>
            {searchResults.map((result) => (
              <Card key={result.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">DANFE: {result.danfeNumber}</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {result.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{result.supplier}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Emissão: {formatDate(result.issueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{formatCurrency(result.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Chave de acesso: {result.accessKey}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchKey && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma DANFE encontrada para esta chave de acesso.</p>
            <p className="text-sm">Verifique se a chave foi digitada corretamente.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
