
import { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { School } from "@/lib/types";

type SchoolFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (school: Omit<School, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: School;
};

export function SchoolForm({
  isOpen,
  onClose,
  onSave,
  initialData,
}: SchoolFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [cnpj, setCnpj] = useState(initialData?.cnpj || "");
  const [responsibleName, setResponsibleName] = useState(initialData?.responsibleName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Format CNPJ as user types
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    
    if (value.length <= 14) {
      // Format as XX.XXX.XXX/XXXX-XX
      value = value.replace(/^(\d{2})(\d)/, "$1.$2");
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
      
      setCnpj(value);
    }
  };

  // Validate CNPJ
  const validateCnpj = (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    
    if (cleanCnpj.length !== 14) {
      return false;
    }
    
    // Check for all same digits
    if (/^(\d)\1+$/.test(cleanCnpj)) {
      return false;
    }
    
    // This is a simple validation for demo purposes
    // In a real app, we would implement the complete CNPJ validation algorithm
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !cnpj || !responsibleName || !email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateCnpj(cnpj)) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, insira um CNPJ válido.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSave({
        name,
        cnpj,
        responsibleName,
        email,
        status: "active", // Adding the required status property with default value "active"
      });
      
      toast({
        title: initialData ? "Escola atualizada" : "Escola cadastrada",
        description: initialData 
          ? "A escola foi atualizada com sucesso." 
          : "A escola foi cadastrada com sucesso.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a escola.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Escola" : "Nova Escola"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Atualize os dados da escola no sistema." 
              : "Cadastre uma nova escola no sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Escola *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da instituição"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={handleCnpjChange}
                placeholder="XX.XXX.XXX/XXXX-XX"
                required
                maxLength={18}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsible">Nome do Responsável *</Label>
              <Input
                id="responsible"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                placeholder="Nome completo do responsável"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Contato *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : initialData ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
