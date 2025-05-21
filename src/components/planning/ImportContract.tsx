
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const importFormSchema = z.object({
  ataNumber: z.string().min(10, "Número de ATA inválido").regex(/^ATA-\d{4}-\d{4}$/, "Formato incorreto. Use ATA-AAAA-XXXX"),
  contractFile: z.any(),
});

export function ImportContract() {
  const { toast } = useToast();
  const { currentSchool } = useAuth();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      ataNumber: "",
      contractFile: null,
    },
  });

  const onSubmit = async (data: z.infer<typeof importFormSchema>) => {
    if (!currentSchool) return;
    
    setIsUploading(true);
    
    try {
      // In a real app, validate ATA number from API
      // For demo, we'll check localStorage
      const plans = JSON.parse(localStorage.getItem(`plans_${currentSchool.id}`) || "[]");
      const validAta = plans.some(p => p.ataNumber === data.ataNumber && p.schoolId === currentSchool.id);
      
      if (!validAta) {
        toast({
          title: "Erro ao importar contrato",
          description: "Número da ATA inválido ou não encontrado. Finalize o planejamento primeiro.",
          variant: "destructive"
        });
        return;
      }
      
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Contrato importado com sucesso",
        description: `O contrato para a ATA ${data.ataNumber} foi importado.`
      });
      
      setOpen(false);
      form.reset();
      
    } catch (error) {
      toast({
        title: "Erro ao importar contrato",
        description: "Ocorreu um erro ao processar o arquivo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="p-6 border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Importar Contrato</h3>
            <p className="text-sm text-muted-foreground">
              Importe um contrato baseado em uma ATA finalizada
            </p>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Contrato</DialogTitle>
          <DialogDescription>
            Informe o número da ATA e selecione o arquivo do contrato para importação.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ataNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da ATA</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ATA-2025-0001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contractFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arquivo do Contrato</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Processando...
                </>
              ) : (
                <>
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Importar Contrato
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
