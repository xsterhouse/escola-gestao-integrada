
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { School, PurchasingCenter } from "@/lib/types";
import { Upload, X } from "lucide-react";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { syncSchoolPurchasingRelationship } from "@/utils/schoolPurchasingSync";

type ModernSchoolFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (school: Omit<School, "id" | "createdAt" | "updatedAt" | "status">) => Promise<string>; // Return school ID
  initialData?: School;
};

export function ModernSchoolForm({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ModernSchoolFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    tradingName: "",
    cnpj: "",
    director: "",
    responsibleName: "",
    email: "",
    phone: "",
    address: "",
    cityState: "",
    logo: "",
    purchasingCenterIds: [] as string[],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPurchasingCenterIds, setOriginalPurchasingCenterIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { data: purchasingCenters } = useLocalStorageSync<PurchasingCenter>('purchasing-centers', []);

  // Effect to populate form data when initialData changes
  useEffect(() => {
    console.log('InitialData changed:', initialData);
    if (initialData) {
      const purchasingIds = initialData.purchasingCenterIds || [];
      setFormData({
        name: initialData.name || "",
        tradingName: initialData.tradingName || "",
        cnpj: initialData.cnpj || "",
        director: initialData.director || "",
        responsibleName: initialData.responsibleName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        cityState: initialData.cityState || "",
        logo: initialData.logo || "",
        purchasingCenterIds: purchasingIds,
      });
      setOriginalPurchasingCenterIds(purchasingIds);
    } else {
      // Reset form for new school
      setFormData({
        name: "",
        tradingName: "",
        cnpj: "",
        director: "",
        responsibleName: "",
        email: "",
        phone: "",
        address: "",
        cityState: "",
        logo: "",
        purchasingCenterIds: [],
      });
      setOriginalPurchasingCenterIds([]);
    }
  }, [initialData]);

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

  const handlePurchasingCenterChange = (centerId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      purchasingCenterIds: checked 
        ? [...prev.purchasingCenterIds, centerId]
        : prev.purchasingCenterIds.filter(id => id !== centerId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cnpj || !formData.responsibleName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate code from CNPJ (first 8 digits)
      const code = formData.cnpj.replace(/\D/g, '').substring(0, 8);
      
      console.log("💾 Salvando escola:", {
        isEdit: !!initialData,
        schoolId: initialData?.id,
        oldPurchasingCenterIds: originalPurchasingCenterIds,
        newPurchasingCenterIds: formData.purchasingCenterIds
      });

      // Salvar a escola e obter o ID
      const schoolId = await onSave({
        ...formData,
        code,
      });

      console.log("✅ Escola salva com ID:", schoolId);

      // Sincronizar relacionamento bidirecional sempre (criação ou edição)
      if (formData.purchasingCenterIds.length > 0) {
        console.log("🔄 Executando sincronização escola-centrais:", {
          schoolId,
          oldIds: originalPurchasingCenterIds,
          newIds: formData.purchasingCenterIds,
          isEdit: !!initialData
        });
        
        syncSchoolPurchasingRelationship(
          schoolId,
          formData.purchasingCenterIds,
          originalPurchasingCenterIds
        );
        
        console.log("✅ Sincronização concluída");
      }
      
      toast({
        title: initialData ? "Escola atualizada" : "Escola cadastrada",
        description: initialData 
          ? "A escola foi atualizada com sucesso." 
          : "A escola foi cadastrada com sucesso.",
      });
      
      onClose();
    } catch (error) {
      console.error("❌ Erro ao salvar escola:", error);
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
              />
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
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
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

            {/* Centrais de Compras Section */}
            <div className="md:col-span-2 space-y-2">
              <Label>Centrais de Compras</Label>
              <div className="border rounded-md p-4 space-y-3 max-h-40 overflow-y-auto">
                {purchasingCenters.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma central de compras cadastrada.</p>
                ) : (
                  purchasingCenters.map((center) => (
                    <div key={center.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`center-${center.id}`}
                        checked={formData.purchasingCenterIds.includes(center.id)}
                        onCheckedChange={(checked) => 
                          handlePurchasingCenterChange(center.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`center-${center.id}`} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        <div>
                          <div className="font-medium">{center.name}</div>
                          {center.description && (
                            <div className="text-xs text-gray-500">{center.description}</div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))
                )}
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
