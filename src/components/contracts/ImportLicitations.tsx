
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LicitationItem = {
  id: string;
  item: string;
  quantity: number;
  supplier: string;
  cost: number;
  validity: string;
};

export function ImportLicitations() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<LicitationItem[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({
        title: "Arquivo selecionado",
        description: `${selectedFile.name} pronto para importação`,
      });
    }
  };

  const handleImport = () => {
    if (!file) return;
    
    // Mock data import - in a real app, this would parse Excel/CSV
    const mockData: LicitationItem[] = [
      { id: "1", item: "Livro Didático Matemática", quantity: 500, supplier: "Editora Educação LTDA", cost: 45.90, validity: "31/12/2024" },
      { id: "2", item: "Caderno Universitário", quantity: 1200, supplier: "Papelaria Central", cost: 15.50, validity: "31/12/2024" },
      { id: "3", item: "Kit Lápis e Canetas", quantity: 800, supplier: "Material Escolar S.A.", cost: 22.75, validity: "31/12/2024" },
      { id: "4", item: "Atlas Geográfico", quantity: 300, supplier: "Editora Mapas", cost: 87.20, validity: "31/12/2024" },
    ];
    
    setItems(mockData);
    toast({
      title: "Dados importados com sucesso",
      description: `${mockData.length} itens carregados da licitação`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importação da Relação de Licitação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          <label className="flex flex-col items-center cursor-pointer">
            <Upload className="h-10 w-10 mb-2 text-gray-500" />
            <span className="text-sm font-medium mb-1">Clique para fazer upload</span>
            <span className="text-xs text-muted-foreground mb-3">XLSX ou CSV</span>
            <Button variant="outline">Selecionar arquivo</Button>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
            <Button onClick={handleImport}>Importar Dados</Button>
          </div>
        )}

        {items.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Fornecedor Vencedor</TableHead>
                  <TableHead className="text-right">Preço de Custo</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>{item.item}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {item.cost.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell>{item.validity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
