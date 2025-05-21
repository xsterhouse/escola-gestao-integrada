
import { PurchasingCenter } from "@/lib/types";

// Mock purchasing centers for demo
export const MOCK_PURCHASING_CENTERS: PurchasingCenter[] = [
  {
    id: "1",
    name: "Central Municipal",
    description: "Central de Compras Municipal",
    schoolIds: ["1", "3"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    name: "Central Regional Norte",
    description: "Central de Compras Regional Norte",
    schoolIds: ["2"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const getCurrentPurchasingCenter = (schoolId: string) => {
  return MOCK_PURCHASING_CENTERS.find(center => 
    center.schoolIds.includes(schoolId)
  );
};

export const getSchoolsInSamePurchasingCenter = (currentSchoolId: string, availableSchools: any[]) => {
  const purchasingCenter = getCurrentPurchasingCenter(currentSchoolId);
  if (!purchasingCenter) return [];
  
  return availableSchools.filter(school => 
    school.id !== currentSchoolId && // Exclude current school
    purchasingCenter.schoolIds.includes(school.id)
  );
};
