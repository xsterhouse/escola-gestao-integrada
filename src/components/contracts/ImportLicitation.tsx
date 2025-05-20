
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface LicitationItem {
  id: number;
  item: string;
  quantity: number;
  supplier: string;
  price: number;
  validity: string;
  editing?: boolean;
}

export default function ImportLicitation() {
  const [file, setFile] = useState<File | null>(null);
  const [imported, setImported] = useState(false);
  const [items, setItems] = useState<LicitationItem[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = () => {
    // Simulate import from Excel/CSV
    setImported(true);
    // Mock data
    setItems([
      { id: 1, item: "Caderno 96 folhas", quantity: 500, supplier: "Papelaria ABC", price: 14.90, validity: "2025-12-31" },
      { id: 2, item: "Lápis HB", quantity: 2000, supplier: "Material Escolar Ltda", price: 1.5, validity: "2025-12-31" },
      { id: 3, item: "Borracha branca", quantity: 1000, supplier: "Papelaria ABC", price: 2.0, validity: "2025-12-31" },
      { id: 4, item: "Caneta esferográfica azul", quantity: 1500, supplier: "Material Escolar Ltda", price: 1.75, validity: "2025-12-31" },
      { id: 5, item: "Apontador com depósito", quantity: 800, supplier: "Papelaria ABC", price: 3.5, validity: "2025-12-31" },
    ]);
  };

  const startEditing = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, editing: true } : item
      )
    );
  };

  const saveEdit = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, editing: false } : item
      )
    );
  };

  const updateItemField = (id: number, field: keyof LicitationItem, value: any) => {
    setItems(
      items.map((item) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importação da Relação de Licitação</CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-4">
              Arraste e solte seu arquivo .xlsx ou .csv aqui, ou clique para selecionar
            </p>
            <Button onClick={() => document.getElementById("upload-excel")?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              Selecionar Arquivo
            </Button>
            <input
              type="file"
              id="upload-excel"
              className="hidden"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                <span className="font-medium">{file.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              {!imported ? (
                <Button onClick={handleImport}>
                  Importar Dados
                </Button>
              ) : (
                <div className="flex items-center text-green-600">
                  <Check className="mr-1 h-5 w-5" />
                  <span>Importado</span>
                </div>
              )}
            </div>

            {imported && items.length > 0 && (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Fornecedor Vencedor</TableHead>
                      <TableHead>Preço de Custo</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <TableCell>
                          {item.editing ? (
                            <Input 
                              value={item.item} 
                              onChange={(e) => updateItemField(item.id, "item", e.target.value)} 
                              className="h-8"
                            />
                          ) : (
                            item.item
                          )}
                        </TableCell>
                        <TableCell>
                          {item.editing ? (
                            <Input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => updateItemField(item.id, "quantity", parseInt(e.target.value))} 
                              className="h-8"
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell>
                          {item.editing ? (
                            <Input 
                              value={item.supplier} 
                              onChange={(e) => updateItemField(item.id, "supplier", e.target.value)} 
                              className="h-8"
                            />
                          ) : (
                            item.supplier
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.editing ? (
                            <Input 
                              type="number" 
                              step="0.01" 
                              value={item.price} 
                              onChange={(e) => updateItemField(item.id, "price", parseFloat(e.target.value))} 
                              className="h-8"
                            />
                          ) : (
                            `R$ ${item.price.toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell>
                          {item.editing ? (
                            <Input 
                              type="date" 
                              value={item.validity} 
                              onChange={(e) => updateItemField(item.id, "validity", e.target.value)} 
                              className="h-8"
                            />
                          ) : (
                            new Date(item.validity).toLocaleDateString("pt-BR")
                          )}
                        </TableCell>
                        <TableCell>
                          {item.editing ? (
                            <Button size="sm" onClick={() => saveEdit(item.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => startEditing(item.id)}>
                              Editar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
