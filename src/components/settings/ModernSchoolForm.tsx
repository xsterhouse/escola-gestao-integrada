
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
import { Upload, X } from "lucide-react";

type ModernSchoolFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (school: Omit<School, "id" | "createdAt" | "updatedAt" | "status">) => void;
  initialData?: School;
};

export function ModernSchoolForm({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ModernSchoolFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    tradingName: initialData?.tradingName || "",
    cnpj: initialData?.cnpj || "",
    director: initialData?.director || "",
    responsibleName: initialData?.responsibleName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    cityState: initialData?.cityState || "",
    logo: initialData?.logo || "",
    purchasingCenterId: initialData?.purchasingCenterId || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cnpjError, setCnpjError] = useState("");
  const { toast } = useToast();

  const validateCNPJ = async (cnpj: string) => {
    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    if (cleanCNPJ.length !== 14) {
      setCnpjError("CNPJ deve ter 14 dígitos");
      return false;
    }

    // Simulação de validação de CNPJ ativo (em produção, usar API da Receita Federal)
    const isValid = await simulateCNPJValidation(cleanCNPJ);
    if (!isValid) {
      setCnpjError("CNPJ inválido ou inativo");
      return false;
    }

    setCnpjError("");
    return true;
  };

  const simulateCNPJValidation = async (cnpj: string): Promise<boolean> => {
    // Simulação - em produção, fazer chamada para API da Receita Federal
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Aceitar CNPJs que começam com 11, 12, 13 como válidos para demo
    return cnpj.startsWith('11') || cnpj.startsWith('12') || cnpj.startsWith('13');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cnpj || !formData.responsibleName || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const cnpjValid = await validateCNPJ(formData.cnpj);
    if (!cnpjValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSave(formData);
      
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Logo Upload */}
            <div className="md:col-span-2 space-y-2">
              <Label>Logotipo</Label>
              <div className="flex items-center gap-4">
                {formData.logo && (
                  <div className="relative">
                    <img 
                      src={formData.logo} 
                      alt="Logo preview" 
                      className="h-16 w-16 object-contain border rounded"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="flex items-center gap-2" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Carregar Imagem
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Instituição *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome da instituição"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradingName">Nome Fantasia</Label>
              <Input
                id="tradingName"
                value={formData.tradingName}
                onChange={(e) => setFormData(prev => ({ ...prev, tradingName: e.target.value }))}
                placeholder="Nome fantasia"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
                required
                className={cnpjError ? "border-red-500" : ""}
              />
              {cnpjError && (
                <p className="text-sm text-red-500">{cnpjError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">Diretor(a)</Label>
              <Input
                id="director"
                value={formData.director}
                onChange={(e) => setFormData(prev => ({ ...prev, director: e.target.value }))}
                placeholder="Nome do diretor ou diretora"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsibleName">Responsável *</Label>
              <Input
                id="responsibleName"
                value={formData.responsibleName}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
                placeholder="Nome do responsável"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, número, bairro"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cityState">Cidade/Estado</Label>
              <Input
                id="cityState"
                value={formData.cityState}
                onChange={(e) => setFormData(prev => ({ ...prev, cityState: e.target.value }))}
                placeholder="Cidade/UF"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasingCenterId">Central de Compras</Label>
              <Input
                id="purchasingCenterId"
                value={formData.purchasingCenterId}
                onChange={(e) => setFormData(prev => ({ ...prev, purchasingCenterId: e.target.value }))}
                placeholder="ID da Central de Compras"
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
