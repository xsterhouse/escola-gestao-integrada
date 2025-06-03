import { PurchasingCenter } from "@/lib/types";

// Mock purchasing centers for demo
export const mockPurchasingCenters: PurchasingCenter[] = [
  {
    id: "pc1",
    name: "Central de Compras Norte",
    code: "CCN001",
    description: "Central responsável pelas escolas da região norte",
    schoolIds: ["school1", "school2"],
    status: "active",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "pc2", 
    name: "Central de Compras Sul",
    code: "CCS001",
    description: "Central responsável pelas escolas da região sul",
    schoolIds: ["school3"],
    status: "active",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  }
];

export const getCurrentPurchasingCenter = (schoolId: string) => {
  return mockPurchasingCenters.find(center => 
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
