
import { Planning, PlanningItem, TransferRecord } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export const saveTransferRecord = (
  fromSchoolId: string,
  toSchoolId: string,
  itemId: string,
  quantity: number,
  userName: string
) => {
  const transferRecord: TransferRecord = {
    id: uuidv4(),
    fromSchoolId,
    toSchoolId,
    planningItemId: itemId,
    quantity,
    transferredAt: new Date(),
    transferredBy: userName, // In a real app, use the actual user name
    createdAt: new Date(),
  };
  
  // Save to localStorage
  const transfers = JSON.parse(localStorage.getItem("transfers") || "[]");
  localStorage.setItem("transfers", JSON.stringify([...transfers, transferRecord]));
  
  return transferRecord;
};

export const updateSourcePlanningQuantity = (
  schoolId: string,
  planningId: string,
  itemId: string,
  quantityToSubtract: number
) => {
  const sourcePlans = JSON.parse(localStorage.getItem(`plans_${schoolId}`) || "[]");
  const sourcePlan = sourcePlans.find((p: Planning) => p.id === planningId);
  
  if (!sourcePlan) return null;
  
  const updatedItems = sourcePlan.items.map((item: PlanningItem) => {
    if (item.id === itemId) {
      const availableQty = item.availableQuantity || item.quantity;
      return {
        ...item,
        availableQuantity: availableQty - quantityToSubtract
      };
    }
    return item;
  });
  
  const updatedSourcePlan = {
    ...sourcePlan,
    items: updatedItems
  };
  
  const updatedSourcePlans = sourcePlans.map((p: Planning) => 
    p.id === planningId ? updatedSourcePlan : p
  );
  
  localStorage.setItem(`plans_${schoolId}`, JSON.stringify(updatedSourcePlans));
  
  return { sourcePlan, updatedSourcePlan };
};

export const addToTargetSchoolPlanning = (
  targetSchoolId: string,
  sourcePlan: Planning,
  sourceItemId: string,
  quantity: number
) => {
  const targetPlans = JSON.parse(localStorage.getItem(`plans_${targetSchoolId}`) || "[]");
  const sourceItem = sourcePlan.items.find((item: PlanningItem) => item.id === sourceItemId);
  
  if (!sourceItem) return null;
  
  // Find or create target planning
  let targetPlan = targetPlans.find((p: Planning) => p.status === "draft");
  
  if (!targetPlan) {
    targetPlan = {
      id: uuidv4(),
      schoolId: targetSchoolId,
      status: "draft",
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    targetPlans.push(targetPlan);
  }
  
  // Add transferred item
  const newItem: PlanningItem = {
    id: uuidv4(),
    name: sourceItem.name,
    quantity: quantity,
    unit: sourceItem.unit,
    description: sourceItem.description,
    planningId: targetPlan.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  targetPlan.items.push(newItem);
  
  localStorage.setItem(`plans_${targetSchoolId}`, JSON.stringify(targetPlans));
  
  return { sourceItem, targetPlan, newItem };
};
