
import { Planning, PlanningItem, TransferRecord } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export interface PendingTransfer {
  id: string;
  fromSchoolId: string;
  toSchoolId: string;
  contractId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  justificativa: string;
  status: "pendente" | "aprovada" | "rejeitada";
  createdAt: Date;
  createdBy: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

export const savePendingTransfer = (
  fromSchoolId: string,
  toSchoolId: string,
  contractId: string,
  itemId: string,
  itemName: string,
  quantity: number,
  justificativa: string,
  userName: string
): PendingTransfer => {
  const pendingTransfer: PendingTransfer = {
    id: uuidv4(),
    fromSchoolId,
    toSchoolId,
    contractId,
    itemId,
    itemName,
    quantity,
    justificativa,
    status: "pendente",
    createdAt: new Date(),
    createdBy: userName,
  };
  
  // Save to localStorage
  const transfers = JSON.parse(localStorage.getItem("pendingTransfers") || "[]");
  localStorage.setItem("pendingTransfers", JSON.stringify([...transfers, pendingTransfer]));
  
  return pendingTransfer;
};

export const getPendingTransfersForSchool = (schoolId: string): PendingTransfer[] => {
  const transfers = JSON.parse(localStorage.getItem("pendingTransfers") || "[]");
  return transfers.filter((t: PendingTransfer) => 
    t.toSchoolId === schoolId && t.status === "pendente"
  ).map((t: any) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    approvedAt: t.approvedAt ? new Date(t.approvedAt) : undefined
  }));
};

export const approveTransfer = (
  transferId: string, 
  userName: string
): { success: boolean, transfer?: PendingTransfer } => {
  const transfers = JSON.parse(localStorage.getItem("pendingTransfers") || "[]");
  const transferIndex = transfers.findIndex((t: PendingTransfer) => t.id === transferId);
  
  if (transferIndex === -1) {
    return { success: false };
  }
  
  const transfer = transfers[transferIndex];
  transfer.status = "aprovada";
  transfer.approvedAt = new Date();
  transfer.approvedBy = userName;
  
  // Update storage
  localStorage.setItem("pendingTransfers", JSON.stringify(transfers));
  
  // Execute the transfer logic
  executeTransfer(transfer);
  
  return { success: true, transfer };
};

export const rejectTransfer = (
  transferId: string, 
  userName: string, 
  rejectionReason: string
): { success: boolean, transfer?: PendingTransfer } => {
  const transfers = JSON.parse(localStorage.getItem("pendingTransfers") || "[]");
  const transferIndex = transfers.findIndex((t: PendingTransfer) => t.id === transferId);
  
  if (transferIndex === -1) {
    return { success: false };
  }
  
  const transfer = transfers[transferIndex];
  transfer.status = "rejeitada";
  transfer.approvedAt = new Date();
  transfer.approvedBy = userName;
  transfer.rejectionReason = rejectionReason;
  
  // Update storage
  localStorage.setItem("pendingTransfers", JSON.stringify(transfers));
  
  return { success: true, transfer };
};

const executeTransfer = (transfer: PendingTransfer) => {
  // Update source school's contracts
  updateSourceSchoolContracts(transfer);
  
  // Update destination school's planning
  updateDestinationSchoolPlanning(transfer);
  
  // Create transfer record for history
  createTransferRecord(transfer);
};

const updateSourceSchoolContracts = (transfer: PendingTransfer) => {
  // Update ATA contracts - reduce available quantity
  const contracts = JSON.parse(localStorage.getItem(`ata_contracts_${transfer.fromSchoolId}`) || "[]");
  const updatedContracts = contracts.map((contract: any) => {
    if (contract.id === transfer.contractId) {
      const updatedItems = contract.items.map((item: any) => {
        if (item.id === transfer.itemId) {
          return {
            ...item,
            saldoDisponivel: item.saldoDisponivel - transfer.quantity
          };
        }
        return item;
      });
      return { ...contract, items: updatedItems };
    }
    return contract;
  });
  
  localStorage.setItem(`ata_contracts_${transfer.fromSchoolId}`, JSON.stringify(updatedContracts));
};

const updateDestinationSchoolPlanning = (transfer: PendingTransfer) => {
  // Find or create draft planning for destination school
  const plans = JSON.parse(localStorage.getItem(`plans_${transfer.toSchoolId}`) || "[]");
  let draftPlan = plans.find((p: Planning) => p.status === "draft");
  
  if (!draftPlan) {
    draftPlan = {
      id: uuidv4(),
      schoolId: transfer.toSchoolId,
      status: "draft",
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    plans.push(draftPlan);
  }
  
  // Add transferred item to planning
  const newItem: PlanningItem = {
    id: uuidv4(),
    name: transfer.itemName,
    quantity: transfer.quantity,
    unit: "Un", // Default unit, could be improved
    description: `Transferido de outra escola - ${transfer.justificativa}`,
    planningId: draftPlan.id,
    availableQuantity: transfer.quantity,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  draftPlan.items.push(newItem);
  draftPlan.updatedAt = new Date();
  
  // Update plans
  const updatedPlans = plans.map((p: Planning) => 
    p.id === draftPlan.id ? draftPlan : p
  );
  
  localStorage.setItem(`plans_${transfer.toSchoolId}`, JSON.stringify(updatedPlans));
};

const createTransferRecord = (transfer: PendingTransfer) => {
  const transferRecord: TransferRecord = {
    id: uuidv4(),
    fromSchoolId: transfer.fromSchoolId,
    toSchoolId: transfer.toSchoolId,
    planningId: transfer.contractId,
    transferredAt: new Date(),
    transferredBy: transfer.createdBy,
    items: [],
    notes: transfer.justificativa,
  };
  
  // Save to transfer history
  const transfers = JSON.parse(localStorage.getItem("transfers") || "[]");
  localStorage.setItem("transfers", JSON.stringify([...transfers, transferRecord]));
};

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
    planningId: itemId,
    transferredAt: new Date(),
    transferredBy: userName,
    items: [],
    notes: "",
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
