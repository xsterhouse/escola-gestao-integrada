
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
  onSave: (school: Omit<School, "id" | "createdAt" | "updatedAt" | "status">) => void;
  initialData?: School;
};

export function SchoolForm({
  isOpen,
  onClose,
  onSave,
  initialData,
}: SchoolFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [tradingName, setTradingName] = useState(initialData?.tradingName || "");
  const [cnpj, setCnpj] = useState(initialData?.cnpj || "");
  const [director, setDirector] = useState(initialData?.director || "");
  const [responsibleName, setResponsibleName] = useState(initialData?.responsibleName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [cityState, setCityState] = useState(initialData?.cityState || "");
  const [logo, setLogo] = useState(initialData?.logo || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    
    setIsSubmitting(true);
    
    try {
      onSave({
        name,
        tradingName,
        cnpj,
        director,
        responsibleName,
        email,
        phone,
        address,
        cityState,
        logo,
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
            {initialData ? "Editar Instituição" : "Nova Instituição"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Atualize os dados da instituição no sistema." 
              : "Cadastre uma nova instituição no sistema."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Instituição *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da instituição"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradingName">Nome Fantasia</Label>
              <Input
                id="tradingName"
                value={tradingName}
                onChange={(e) => setTradingName(e.target.value)}
                placeholder="Nome fantasia"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">Diretor(a)</Label>
              <Input
                id="director"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Nome do diretor ou diretora"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsibleName">Responsável *</Label>
              <Input
                id="responsibleName"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                placeholder="Nome do responsável"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cityState">Cidade/Estado</Label>
              <Input
                id="cityState"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="Cidade/UF"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logotipo (URL)</Label>
              <Input
                id="logo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="URL da imagem"
              />
              {logo && (
                <div className="mt-2 p-2 border rounded flex justify-center">
                  <img 
                    src={logo} 
                    alt="Logo preview" 
                    className="h-20 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Logo+error";
                    }}
                  />
                </div>
              )}
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
