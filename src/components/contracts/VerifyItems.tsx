
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationItem {
  id: number;
  product: string;
  contractQty: number;
  invoiceQty: number;
  receivedQty: number;
  verified: boolean;
  notes: string;
}

export default function VerifyItems() {
  const { toast } = useToast();
  const [items, setItems] = useState<VerificationItem[]>([
    { id: 1, product: "Caderno 96 folhas", contractQty: 500, invoiceQty: 500, receivedQty: 0, verified: false, notes: "" },
    { id: 2, product: "Lápis HB", contractQty: 2000, invoiceQty: 100, receivedQty: 0, verified: false, notes: "" },
    { id: 3, product: "Borracha branca", contractQty: 1000, invoiceQty: 500, receivedQty: 0, verified: false, notes: "" },
    { id: 4, product: "Caneta esferográfica azul", contractQty: 1500, invoiceQty: 50, receivedQty: 0, verified: false, notes: "" },
  ]);
  
  const [confirmed, setConfirmed] = useState(false);

  const updateItem = (id: number, field: keyof VerificationItem, value: any) => {
    setItems(
      items.map((item) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const allVerified = items.every(item => item.verified);

  const handleConfirm = () => {
    if (!allVerified) {
      toast({
        title: "Verificação incompleta",
        description: "Por favor, verifique todos os itens antes de confirmar.",
        variant: "destructive"
      });
      return;
    }
    
    setConfirmed(true);
    toast({
      title: "Conferência confirmada",
      description: "Os dados foram enviados para Estoque e Contas a Pagar.",
      variant: "default"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conferência de Itens Recebidos</CardTitle>
      </CardHeader>
      <CardContent>
        {!confirmed ? (
          <div className="space-y-4">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade Contratada</TableHead>
                    <TableHead>Quantidade da Nota</TableHead>
                    <TableHead>Quantidade Recebida</TableHead>
                    <TableHead className="w-[100px]">Verificado</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>{item.contractQty}</TableCell>
                      <TableCell>{item.invoiceQty}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={item.receivedQty} 
                          onChange={(e) => updateItem(item.id, "receivedQty", parseInt(e.target.value || "0"))}
                          className="h-8 w-24"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={item.verified}
                          onCheckedChange={(checked) => updateItem(item.id, "verified", Boolean(checked))}
                          className="mx-auto"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.notes} 
                          onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                          placeholder="Observações"
                          className="h-8"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleConfirm}>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Conferência
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-800 mb-2">Conferência realizada com sucesso!</h3>
            <p className="text-green-700">
              Os dados foram enviados para os módulos de Estoque e Contas a Pagar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
