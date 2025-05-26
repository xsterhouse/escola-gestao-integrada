
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface DeleteInvoiceDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (invoiceId: string, reason: string, deletedBy: string) => void;
}

const formSchema = z.object({
  password: z.string().min(1, "Senha é obrigatória"),
  reason: z.string().min(10, "Motivo deve ter pelo menos 10 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export function DeleteInvoiceDialog({ 
  invoice, 
  isOpen, 
  onClose, 
  onDelete 
}: DeleteInvoiceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      reason: "",
    },
  });

  const validateAdminPassword = (password: string): boolean => {
    // Para usuários master, usar a senha padrão
    if (user?.role === "master") {
      return password === "Sigre101020@";
    }
    
    // Para usuários admin de escola, verificar se existe senha salva
    const userPasswords = JSON.parse(localStorage.getItem("userPasswords") || "{}");
    const adminPassword = userPasswords[user?.id || ""];
    
    return adminPassword && adminPassword === password;
  };

  const handleSubmit = (values: FormValues) => {
    setPasswordError(null);
    
    if (!validateAdminPassword(values.password)) {
      setPasswordError("Senha de administrador incorreta");
      return;
    }

    if (!invoice || !user) return;

    setIsLoading(true);
    
    try {
      const deletedBy = user.name;
      onDelete(invoice.id, values.reason, deletedBy);
      
      toast({
        title: "XML excluído",
        description: "A nota fiscal foi excluída com sucesso.",
        variant: "destructive",
      });
      
      form.reset();
      setPasswordError(null);
      onClose();
    } catch (error) {
      toast({
        title: "Erro na exclusão",
        description: "Ocorreu um erro ao excluir a nota fiscal.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setPasswordError(null);
    onClose();
  };

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Nota Fiscal</DialogTitle>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção!</strong> Esta ação não pode ser desfeita. A nota fiscal será excluída permanentemente.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p><strong>DANFE:</strong> {invoice.danfeNumber}</p>
          <p><strong>Fornecedor:</strong> {invoice.supplier.name}</p>
          <p><strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(invoice.totalValue)}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha do Administrador</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Digite a senha de administrador"
                      {...field}
                    />
                  </FormControl>
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Exclusão</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o motivo da exclusão..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isLoading}
              >
                {isLoading ? "Excluindo..." : "Excluir XML"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
