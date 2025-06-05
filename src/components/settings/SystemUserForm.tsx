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
    // Check if it's wrapped format with data property
    if (centerItem.data) {
      return {
        id: centerItem.data.id,
        name: centerItem.data.name,
        schoolIds: centerItem.data.schoolIds || []
      };
    }
    // Direct format
    return {
      id: centerItem.id,
      name: centerItem.name,
      schoolIds: centerItem.schoolIds || []
    };
  });

  // Reload data when modal opens to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      console.log("🔄 Modal aberto - recarregando dados das centrais de compras");
      reloadPurchasingCenters();
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

  // Filter purchasing centers based on selected school and user type
  const availablePurchasingCenters = userType === "purchasing_center" 
    ? purchasingCenters 
    : formData.schoolId && formData.schoolId !== "none" && formData.schoolId !== ""
      ? purchasingCenters.filter(center => {
          const hasSchoolInList = center.schoolIds?.includes(formData.schoolId);
          console.log(`🔍 Verificando central "${center.name}":`, {
            centerId: center.id,
            centerSchoolIds: center.schoolIds,
            selectedSchoolId: formData.schoolId,
            hasSchoolInList,
            schoolIdsType: typeof center.schoolIds,
            schoolIdsLength: center.schoolIds?.length
          });
          return hasSchoolInList;
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
    
    // Force reload purchasing centers data when school changes
    reloadPurchasingCenters();
    
    // Find linked purchasing centers for this school
    const linkedCenters = purchasingCenters.filter(center => 
      center.schoolIds?.includes(schoolId)
    );
    
    console.log("🔗 Centrais vinculadas encontradas para escola:", {
      schoolId,
      linkedCenters: linkedCenters.map(c => ({ id: c.id, name: c.name, schoolIds: c.schoolIds })),
      allCenters: purchasingCenters.map(c => ({ id: c.id, name: c.name, schoolIds: c.schoolIds }))
    });
    
    setFormData(prev => ({ 
      ...prev, 
      schoolId,
      purchasingCenterIds: [], // Reset purchasing centers when school changes
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
                <div className="text-sm text-gray-500 p-3 border rounded-md bg-gray-50">
                  Esta escola não está vinculada a nenhuma central de compras.
                  <br />
                  <span className="text-xs">
                    Vincule a escola a uma central na aba "Central de Compras" primeiro.
                    <br />
                    Dados atuais: {purchasingCenters.length} centrais encontradas
                  </span>
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
