
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PlanningImport: React.FC = () => {
  const { currentSchool } = useAuth();
  const [ataNumber, setAtaNumber] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ataNumber) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o número da ATA.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate ATA number format
    const ataPattern = /^ATA-\d{4}-\d{4}$/;
    if (!ataPattern.test(ataNumber)) {
      toast({
        title: "Formato inválido",
        description: "O número da ATA deve seguir o formato ATA-AAAA-XXXX.",
        variant: "destructive",
      });
      return;
    }
    
    // Here we would validate if the ATA exists and belongs to the current school
    // For demo purposes, let's just check if it starts with the correct format
    setIsUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      
      // In a real app, we would validate if the ATA exists
      const ataExists = Math.random() > 0.5; // Randomly succeed or fail for demo
      
      if (ataExists) {
        toast({
          title: "Contrato importado",
          description: `Contrato para ATA ${ataNumber} importado com sucesso.`,
        });
        setAtaNumber("");
      } else {
        toast({
          title: "ATA não encontrada",
          description: "Número da ATA inválido ou não encontrado. Finalize o planejamento primeiro.",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Contrato</CardTitle>
        <CardDescription>
          Importe um contrato usando o número da ATA finalizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleImport} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ataNumber">Número da ATA</Label>
            <Input
              id="ataNumber"
              value={ataNumber}
              onChange={(e) => setAtaNumber(e.target.value)}
              placeholder="Ex: ATA-2025-0001"
              required
            />
            <p className="text-xs text-muted-foreground">
              O número da ATA deve seguir o formato ATA-AAAA-XXXX.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isUploading}
          >
            {isUploading ? "Importando..." : "Importar Contrato"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlanningImport;
