
import { School, PurchasingCenter } from "@/lib/types";

/**
 * Sincroniza o relacionamento bidirecional entre escola e centrais de compras
 */
export const syncSchoolPurchasingRelationship = (
  schoolId: string,
  newPurchasingCenterIds: string[],
  oldPurchasingCenterIds: string[] = []
) => {
  try {
    console.log("🔄 Iniciando sincronização escola-centrais:", {
      schoolId,
      newPurchasingCenterIds,
      oldPurchasingCenterIds
    });

    // Carregar centrais de compras do localStorage
    const storedCenters = localStorage.getItem("purchasing-centers");
    if (!storedCenters) {
      console.log("⚠️ Nenhuma central de compras encontrada no localStorage");
      return;
    }

    let centers = JSON.parse(storedCenters);
    
    // Verificar se é array de objetos com propriedade 'data'
    const isWrappedFormat = Array.isArray(centers) && centers.length > 0 && centers[0].data;
    
    // Processar centrais removidas (estavam no old mas não estão no new)
    const removedCenterIds = oldPurchasingCenterIds.filter(id => !newPurchasingCenterIds.includes(id));
    
    // Processar centrais adicionadas (estão no new mas não estavam no old)
    const addedCenterIds = newPurchasingCenterIds.filter(id => !oldPurchasingCenterIds.includes(id));

    console.log("📊 Análise de mudanças:", {
      removedCenterIds,
      addedCenterIds
    });

    let hasChanges = false;

    // Atualizar centrais
    centers = centers.map((centerItem: any) => {
      const center = isWrappedFormat ? centerItem.data : centerItem;
      
      if (!center.schoolIds) {
        center.schoolIds = [];
      }

      // Remover escola das centrais que foram desmarcadas
      if (removedCenterIds.includes(center.id)) {
        const oldLength = center.schoolIds.length;
        center.schoolIds = center.schoolIds.filter((id: string) => id !== schoolId);
        if (center.schoolIds.length !== oldLength) {
          hasChanges = true;
          console.log(`➖ Removida escola ${schoolId} da central ${center.name}`);
        }
      }

      // Adicionar escola às centrais que foram marcadas
      if (addedCenterIds.includes(center.id)) {
        if (!center.schoolIds.includes(schoolId)) {
          center.schoolIds.push(schoolId);
          hasChanges = true;
          console.log(`➕ Adicionada escola ${schoolId} à central ${center.name}`);
        }
      }

      // Atualizar updatedAt
      if (removedCenterIds.includes(center.id) || addedCenterIds.includes(center.id)) {
        center.updatedAt = new Date().toISOString();
      }

      return isWrappedFormat ? { ...centerItem, data: center } : center;
    });

    // Salvar apenas se houve mudanças
    if (hasChanges) {
      localStorage.setItem("purchasing-centers", JSON.stringify(centers));
      console.log("✅ Sincronização concluída com sucesso");
    } else {
      console.log("ℹ️ Nenhuma mudança necessária na sincronização");
    }

  } catch (error) {
    console.error("❌ Erro durante sincronização:", error);
  }
};

/**
 * Verifica se uma escola está vinculada a uma central de compras
 */
export const isSchoolLinkedToPurchasingCenter = (schoolId: string, centerId: string): boolean => {
  try {
    // Verificar do lado da escola
    const storedSchools = localStorage.getItem("schools");
    if (storedSchools) {
      const schools = JSON.parse(storedSchools);
      const school = schools.find((s: School) => s.id === schoolId);
      if (school?.purchasingCenterIds?.includes(centerId)) {
        return true;
      }
    }

    // Verificar do lado da central
    const storedCenters = localStorage.getItem("purchasing-centers");
    if (storedCenters) {
      const centers = JSON.parse(storedCenters);
      const isWrappedFormat = Array.isArray(centers) && centers.length > 0 && centers[0].data;
      
      const center = centers.find((c: any) => {
        const centerData = isWrappedFormat ? c.data : c;
        return centerData.id === centerId;
      });
      
      if (center) {
        const centerData = isWrappedFormat ? center.data : center;
        return centerData.schoolIds?.includes(schoolId) || false;
      }
    }

    return false;
  } catch (error) {
    console.error("Erro ao verificar vinculação:", error);
    return false;
  }
};
