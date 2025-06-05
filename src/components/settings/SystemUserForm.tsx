import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff, Building, ShoppingCart } from "lucide-react";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { syncSchoolPurchasingRelationship } from "@/utils/schoolPurchasingSync";

interface SystemUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  schools: any[];
}

interface PurchasingCenter {
  id: string;
  name: string;
  schoolIds?: string[];
  data?: {
    id: string;
    name: string;
    schoolIds?: string[];
  };
}

// Função para sincronizar todas as vinculações escola-central
const syncAllSchoolPurchasingRelationships = () => {
  try {
    console.log("🔄 Executando sincronização automática de todas as vinculações...");
    
    const storedSchools = localStorage.getItem("schools");
    const storedCenters = localStorage.getItem("purchasing-centers");
    
    if (!storedSchools || !storedCenters) {
      console.log("⚠️ Dados não encontrados para sincronização");
      return;
    }
    
    const schools = JSON.parse(storedSchools);
    let centers = JSON.parse(storedCenters);
    
    const isWrappedFormat = Array.isArray(centers) && centers.length > 0 && centers[0].data;
    let hasChanges = false;
    
    // Para cada escola que tem centrais vinculadas
    schools.forEach((school: any) => {
      if (school.purchasingCenterIds && school.purchasingCenterIds.length > 0) {
        school.purchasingCenterIds.forEach((centerId: string) => {
          const centerIndex = centers.findIndex((c: any) => {
            const centerData = isWrappedFormat ? c.data : c;
            return centerData.id === centerId;
          });
          
          if (centerIndex !== -1) {
            const centerData = isWrappedFormat ? centers[centerIndex].data : centers[centerIndex];
            
            if (!centerData.schoolIds) {
              centerData.schoolIds = [];
            }
            
            if (!centerData.schoolIds.includes(school.id)) {
              centerData.schoolIds.push(school.id);
              centerData.updatedAt = new Date().toISOString();
              hasChanges = true;
              console.log(`➕ Adicionada escola ${school.name} à central ${centerData.name}`);
            }
          }
        });
      }
    });
    
    if (hasChanges) {
      localStorage.setItem("purchasing-centers", JSON.stringify(centers));
      console.log("✅ Sincronização automática concluída");
    } else {
      console.log("ℹ️ Nenhuma sincronização necessária");
    }
    
  } catch (error) {
    console.error("❌ Erro na sincronização automática:", error);
  }
};

export function SystemUserForm({ isOpen, onClose, onSave, schools }: SystemUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"school" | "purchasing_center">("school");
  const [formData, setFormData] = useState({
    name: "",
    matricula: "",
    password: "",
    confirmPassword: "",
    schoolId: "",
    purchasingCenterIds: [] as string[],
    isLinkedToPurchasing: false,
    status: "active" as "active" | "blocked"
  });

  const { data: purchasingCentersRaw, loadData: reloadPurchasingCenters } = useLocalStorageSync<PurchasingCenter>('purchasing-centers', []);

  // Normalize purchasing centers data structure
  const purchasingCenters = purchasingCentersRaw.map((centerItem: any) => {
    if (centerItem.data) {
      return {
        id: centerItem.data.id,
        name: centerItem.data.name,
        schoolIds: centerItem.data.schoolIds || []
      };
    }
    return {
      id: centerItem.id,
      name: centerItem.name,
      schoolIds: centerItem.schoolIds || []
    };
  });

  // Execute auto-sync when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("🔄 Modal aberto - executando sincronização automática");
      syncAllSchoolPurchasingRelationships();
      // Recarregar dados após sincronização
      setTimeout(() => {
        reloadPurchasingCenters();
      }, 100);
    }
  }, [isOpen, reloadPurchasingCenters]);

  console.log("🏢 SystemUserForm - Dados detalhados:", {
    schools: schools.length,
    purchasingCentersRaw: purchasingCentersRaw.length,
    purchasingCenters: purchasingCenters.length,
    selectedSchoolId: formData.schoolId,
    allCenters: purchasingCenters.map(c => ({
      id: c.id,
      name: c.name,
      schoolIds: c.schoolIds,
      hasSelectedSchool: c.schoolIds?.includes(formData.schoolId)
    }))
  });

  // Filter purchasing centers with improved validation
  const availablePurchasingCenters = userType === "purchasing_center" 
    ? purchasingCenters 
    : formData.schoolId && formData.schoolId !== "none" && formData.schoolId !== ""
      ? purchasingCenters.filter(center => {
          const hasSchoolInList = center.schoolIds?.includes(formData.schoolId);
          
          // Verificação adicional: buscar também do lado da escola
          const selectedSchool = schools.find(s => s.id === formData.schoolId);
          const schoolHasCenter = selectedSchool?.purchasingCenterIds?.includes(center.id);
          
          console.log(`🔍 Verificando central "${center.name}":`, {
            centerId: center.id,
            centerSchoolIds: center.schoolIds,
            selectedSchoolId: formData.schoolId,
            hasSchoolInList,
            schoolHasCenter,
            finalResult: hasSchoolInList || schoolHasCenter
          });
          
          return hasSchoolInList || schoolHasCenter;
        })
      : [];

  console.log("🎯 Resultado final das centrais disponíveis:", {
    userType,
    selectedSchoolId: formData.schoolId,
    totalCenters: purchasingCenters.length,
    availableCenters: availablePurchasingCenters.length,
    centers: availablePurchasingCenters.map(c => ({ id: c.id, name: c.name }))
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (type: "school" | "purchasing_center") => {
    console.log("👤 Mudando tipo de usuário para:", type);
    setUserType(type);
    setFormData(prev => ({ 
      ...prev, 
      schoolId: "",
      purchasingCenterIds: [],
      isLinkedToPurchasing: type === "purchasing_center"
    }));
  };

  const handleSchoolChange = (schoolId: string) => {
    console.log("🏫 Escola selecionada:", schoolId);
    console.log("🏫 Dados da escola selecionada:", schools.find(s => s.id === schoolId));
    
    // Execute sync before processing
    syncAllSchoolPurchasingRelationships();
    
    // Force reload purchasing centers data when school changes
    setTimeout(() => {
      reloadPurchasingCenters();
    }, 100);
    
    setFormData(prev => ({ 
      ...prev, 
      schoolId,
      purchasingCenterIds: [],
      isLinkedToPurchasing: userType === "purchasing_center"
    }));
  };

  const handlePurchasingCenterChange = (centerId: string, checked: boolean) => {
    console.log("🛒 Central de compras alterada:", { centerId, checked });
    
    setFormData(prev => ({
      ...prev,
      purchasingCenterIds: checked 
        ? [...prev.purchasingCenterIds, centerId]
        : prev.purchasingCenterIds.filter(id => id !== centerId),
      isLinkedToPurchasing: checked || prev.purchasingCenterIds.length > 1 || (prev.purchasingCenterIds.length === 1 && !prev.purchasingCenterIds.includes(centerId))
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    if (!formData.matricula.trim()) {
      alert("Matrícula é obrigatória");
      return;
    }

    if (!formData.password.trim()) {
      alert("Senha é obrigatória");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      alert("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (userType === "school" && (!formData.schoolId || formData.schoolId === "none")) {
      alert("Selecione uma escola");
      return;
    }

    if (userType === "purchasing_center" && formData.purchasingCenterIds.length === 0) {
      alert("Selecione pelo menos uma central de compras");
      return;
    }

    console.log("💾 Salvando usuário:", {
      type: userType,
      schoolId: formData.schoolId,
      purchasingCenterIds: formData.purchasingCenterIds
    });

    // Prepare user data based on type
    const userData = {
      ...formData,
      userType: userType === "purchasing_center" ? "central_compras" : "funcionario",
      hierarchyLevel: userType === "purchasing_center" ? 3 : 4,
      dataScope: userType === "purchasing_center" ? "purchasing_center" : "school",
      canCreateUsers: false,
      canManageSchool: false,
    };

    // If it's a school user linked to purchasing centers, sync the relationship
    if (userType === "school" && formData.schoolId && formData.purchasingCenterIds.length > 0) {
      console.log("🔄 Sincronizando relação escola-centrais de compras");
      syncSchoolPurchasingRelationship(formData.schoolId, formData.purchasingCenterIds, []);
    }

    onSave(userData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      matricula: "",
      password: "",
      confirmPassword: "",
      schoolId: "",
      purchasingCenterIds: [],
      isLinkedToPurchasing: false,
      status: "active"
    });
    setUserType("school");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Usuário do Sistema</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Tipo de Usuário *</Label>
            <RadioGroup value={userType} onValueChange={handleUserTypeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="school" id="school" />
                <Label htmlFor="school" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Usuário de Escola
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="purchasing_center" id="purchasing_center" />
                <Label htmlFor="purchasing_center" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Usuário de Central de Compras
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nome completo do usuário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricula">Matrícula *</Label>
            <Input
              id="matricula"
              name="matricula"
              value={formData.matricula}
              onChange={handleInputChange}
              placeholder="Matrícula do usuário"
              required
            />
          </div>

          {userType === "school" && (
            <div className="space-y-2">
              <Label htmlFor="school">Escola *</Label>
              <Select value={formData.schoolId} onValueChange={handleSchoolChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {userType === "purchasing_center" && (
            <div className="space-y-2">
              <Label>Centrais de Compras *</Label>
              {availablePurchasingCenters.length > 0 ? (
                <div className="space-y-2 border rounded-md p-3 max-h-32 overflow-y-auto">
                  {availablePurchasingCenters.map((center) => (
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
                        className="text-sm font-normal"
                      >
                        {center.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-3 border rounded-md bg-gray-50">
                  Nenhuma central de compras disponível. 
                  Configure as centrais de compras primeiro na aba "Central de Compras".
                </div>
              )}
            </div>
          )}

          {userType === "school" && formData.schoolId && formData.schoolId !== "none" && formData.schoolId !== "" && (
            <div className="space-y-2">
              <Label>Centrais de Compras (Opcional)</Label>
              {availablePurchasingCenters.length > 0 ? (
                <div className="space-y-2 border rounded-md p-3">
                  <div className="text-xs text-blue-600 mb-2">
                    Centrais vinculadas à escola selecionada: {availablePurchasingCenters.length}
                  </div>
                  {availablePurchasingCenters.map((center) => (
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
                        className="text-sm font-normal"
                      >
                        {center.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-amber-600 p-3 border border-amber-200 rounded-md bg-amber-50">
                    ⚠️ Esta escola não está vinculada a nenhuma central de compras ou os dados estão inconsistentes.
                    <br />
                    <span className="text-xs">
                      Para vincular, vá na aba "Central de Compras" → editar a central → marcar esta escola.
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("🔄 Forçando sincronização manual...");
                      syncAllSchoolPurchasingRelationships();
                      setTimeout(() => {
                        reloadPurchasingCenters();
                      }, 200);
                    }}
                    className="w-full"
                  >
                    🔄 Tentar Sincronizar Dados
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Senha mínima 6 caracteres"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirme a senha"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Criar Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
