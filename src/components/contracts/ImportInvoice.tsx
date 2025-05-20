
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface InvoiceItem {
  id: number;
  product: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: "valid" | "invalid";
}

interface Invoice {
  id: string;
  number: string;
  supplier: string;
  date: string;
  totalValue: number;
  items: InvoiceItem[];
}

export default function ImportInvoice() {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setValidating(true);
      
      // Simulate XML parsing and validation
      setTimeout(() => {
        setValidating(false);
        setInvoice({
          id: "inv-001",
          number: "NF-e 123456",
          supplier: "Papelaria ABC",
          date: "2023-10-15",
          totalValue: 8745.0,
          items: [
            { id: 1, product: "Caderno 96 folhas", quantity: 500, price: 14.90, totalPrice: 7450.0, status: "valid" },
            { id: 2, product: "Lápis HB", quantity: 100, price: 1.50, totalPrice: 150.0, status: "invalid" },
            { id: 3, product: "Borracha branca", quantity: 500, price: 2.0, totalPrice: 1000.0, status: "valid" },
            { id: 4, product: "Caneta esferográfica azul", quantity: 50, price: 1.90, totalPrice: 95.0, status: "valid" },
          ]
        });
      }, 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importação de Notas Fiscais (NF-e XML)</CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-4">
              Arraste e solte seu arquivo XML da NF-e aqui, ou clique para selecionar
            </p>
            <Button onClick={() => document.getElementById("upload-xml")?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              Selecionar Arquivo XML
            </Button>
            <input
              type="file"
              id="upload-xml"
              className="hidden"
              accept=".xml"
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
              {validating ? (
                <div className="flex items-center text-amber-600">
                  <span className="mr-2">Validação em andamento...</span>
                  <div className="h-4 w-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <Check className="mr-1 h-5 w-5" />
                  <span>Validado</span>
                </div>
              )}
            </div>

            {invoice && !validating && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-2">Resumo da Nota Fiscal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Número</p>
                      <p className="font-medium">{invoice.number}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fornecedor</p>
                      <p className="font-medium">{invoice.supplier}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Data de Emissão</p>
                      <p className="font-medium">{new Date(invoice.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valor Total</p>
                      <p className="font-medium">R$ {invoice.totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unitário</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item, index) => (
                        <TableRow key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">R$ {item.totalPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            {item.status === "valid" ? (
                              <div className="flex items-center text-green-600">
                                <Check className="mr-1 h-4 w-4" />
                                <span>Validado</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <X className="mr-1 h-4 w-4" />
                                <span>Divergência</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
