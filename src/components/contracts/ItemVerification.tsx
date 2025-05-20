
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type VerificationItem = {
  id: string;
  product: string;
  contractQuantity: number;
  invoiceQuantity: number;
  receivedQuantity: number;
  verified: boolean;
  observations: string;
};

export function ItemVerification() {
  const [items, setItems] = useState<VerificationItem[]>([
    { 
      id: "1", 
      product: "Livro Didático Matemática", 
      contractQuantity: 500, 
      invoiceQuantity: 500, 
      receivedQuantity: 0, 
      verified: false, 
      observations: "" 
    },
    { 
      id: "2", 
      product: "Caderno Universitário", 
      contractQuantity: 1200, 
      invoiceQuantity: 600, 
      receivedQuantity: 0, 
      verified: false, 
      observations: "" 
    },
    { 
      id: "3", 
      product: "Kit Lápis e Canetas", 
      contractQuantity: 800, 
      invoiceQuantity: 400, 
      receivedQuantity: 0, 
      verified: false, 
      observations: "" 
    },
  ]);

  const { toast } = useToast();

  const handleQuantityChange = (id: string, value: number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, receivedQuantity: value } 
          : item
      )
    );
  };

  const handleVerifiedChange = (id: string, checked: boolean) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, verified: checked } 
          : item
      )
    );
  };

  const handleObservationChange = (id: string, value: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, observations: value } 
          : item
      )
    );
  };

  const handleConfirmVerification = () => {
    const allVerified = items.every(item => item.verified);
    
    if (!allVerified) {
      toast({
        title: "Verificação incompleta",
        description: "Por favor, confira todos os itens antes de prosseguir.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Conferência confirmada",
      description: "Os dados foram enviados para Estoque e Contas a Pagar.",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Conferência de Itens Recebidos</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Cont.</TableHead>
              <TableHead className="text-right">NF</TableHead>
              <TableHead className="text-right">Recebido</TableHead>
              <TableHead>Verificado</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.product}</TableCell>
                <TableCell className="text-right">{item.contractQuantity}</TableCell>
                <TableCell className="text-right">{item.invoiceQuantity}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.receivedQuantity || ""}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-20 text-right"
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={item.verified}
                    onCheckedChange={(checked) => handleVerifiedChange(item.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.observations}
                    onChange={(e) => handleObservationChange(item.id, e.target.value)}
                    placeholder="Observações"
                    className="w-full"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleConfirmVerification}
        >
          Confirmar Conferência
        </Button>
      </CardFooter>
    </Card>
  );
}
