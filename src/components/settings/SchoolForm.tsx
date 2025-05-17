
import { useState, useEffect } from "react";
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
  onSave: (school: Omit<School, "id" | "createdAt" | "updatedAt" | "status">) => void;
  initialData?: School;
};

export function SchoolForm({
  isOpen,
  onClose,
  onSave,
  initialData,
}: SchoolFormProps) {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [cityState, setCityState] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCnpj(initialData.cnpj || '');
      setAddress(initialData.address || '');
      setCityState(initialData.cityState || '');
      setResponsibleName(initialData.responsibleName || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
    } else {
      setName('');
      setCnpj('');
      setAddress('');
      setCityState('');
      setResponsibleName('');
      setPhone('');
      setEmail('');
    }
  }, [initialData]);

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

  // Format phone as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    
    if (value.length <= 11) {
      // Format as (XX) XXXXX-XXXX
      value = value.replace(/^(\d{2})(\d)/, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
      
      setPhone(value);
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
        address,
        cityState,
        responsibleName,
        phone,
        email,
      });
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
      <DialogContent className="sm:max-w-lg">
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
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Nome da Escola *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da instituição"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(XX) XXXXX-XXXX"
                  maxLength={15}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </div>
            
            <div>
              <Label htmlFor="cityState">Cidade/UF</Label>
              <Input
                id="cityState"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="Cidade/UF"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsible">Nome do Responsável *</Label>
                <Input
                  id="responsible"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  placeholder="Nome completo do responsável"
                  required
                />
              </div>
              <div>
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
