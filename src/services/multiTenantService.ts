import { User, Tenant, AuditLog, TransferRequest, UserHierarchy } from "@/lib/types";
import { dataIsolationService } from "./dataIsolationService";

export interface TenantContext {
  tenantId: string;
  tenant: Tenant;
  user: User;
  allowedTenants: string[];
  canAccessTenant: (targetTenantId: string) => boolean;
}

class MultiTenantService {
  private currentContext: TenantContext | null = null;

  setContext(user: User, selectedTenantId?: string) {
    const tenants = this.getUserTenants(user);
    const tenantId = selectedTenantId || this.getDefaultTenant(user, tenants);
    const tenant = tenants.find(t => t.id === tenantId);

    if (!tenant) {
      throw new Error("Tenant not found or access denied");
    }

    this.currentContext = {
      tenantId,
      tenant,
      user,
      allowedTenants: tenants.map(t => t.id),
      canAccessTenant: (targetTenantId: string) => this.canAccessTenant(user, targetTenantId)
    };

    // Set data isolation context
    dataIsolationService.setContext(user);
    
    this.logAudit("tenant_switch", "tenant", tenantId, {
      previousTenant: localStorage.getItem("currentTenantId"),
      newTenant: tenantId
    });

    localStorage.setItem("currentTenantId", tenantId);
  }

  getCurrentContext(): TenantContext | null {
    return this.currentContext;
  }

  getUserTenants(user: User): Tenant[] {
    const tenants: Tenant[] = JSON.parse(localStorage.getItem("tenants") || "[]");
    
    if (user.role === "master") {
      return tenants; // Master can access all tenants
    }

    return tenants.filter(tenant => {
      if (user.userType === "central_compras") {
        // Central de compras can access tenants linked to their purchasing centers
        const purchasingCenters = JSON.parse(localStorage.getItem("purchasingCenters") || "[]");
        const userCenters = purchasingCenters.filter(pc => 
          user.purchasingCenterIds?.includes(pc.id)
        );
        return userCenters.some(center => 
          center.schoolIds?.includes(tenant.id) || tenant.id === user.schoolId
        );
      }

      // Regular users can only access their school's tenant
      return tenant.id === user.schoolId || tenant.id === user.tenantId;
    });
  }

  private getDefaultTenant(user: User, tenants: Tenant[]): string {
    const lastTenantId = localStorage.getItem("currentTenantId");
    
    // Check if last tenant is still valid
    if (lastTenantId && tenants.some(t => t.id === lastTenantId)) {
      return lastTenantId;
    }

    // Default to user's school or first available tenant
    return user.schoolId || user.tenantId || tenants[0]?.id || "";
  }

  canAccessTenant(user: User, tenantId: string): boolean {
    const allowedTenants = this.getUserTenants(user);
    return allowedTenants.some(t => t.id === tenantId);
  }

  getIsolatedStorageKey(baseKey: string, tenantId?: string): string {
    const contextTenantId = tenantId || this.currentContext?.tenantId;
    
    if (!contextTenantId || this.currentContext?.user.role === "master") {
      return baseKey; // Master sees global data
    }

    return `${baseKey}_tenant_${contextTenantId}`;
  }

  filterDataByTenant<T extends { tenantId?: string; schoolId?: string }>(data: T[]): T[] {
    if (!this.currentContext || this.currentContext.user.role === "master") {
      return data; // Master sees all data
    }

    const tenantId = this.currentContext.tenantId;
    return data.filter(item => 
      item.tenantId === tenantId || 
      item.schoolId === tenantId ||
      (!item.tenantId && !item.schoolId) // Legacy data without tenant info
    );
  }

  canCreateTransfer(fromTenantId: string, toTenantId: string): boolean {
    if (!this.currentContext) return false;

    const user = this.currentContext.user;
    
    // Master can create any transfer
    if (user.role === "master") return true;

    // Central de compras can create transfers between linked schools
    if (user.userType === "central_compras") {
      return this.canAccessTenant(user, fromTenantId) && 
             this.canAccessTenant(user, toTenantId);
    }

    // School users can only initiate transfers from their tenant
    return fromTenantId === this.currentContext.tenantId;
  }

  requestTransfer(request: Omit<TransferRequest, 'id' | 'requestedAt' | 'status'>): string {
    if (!this.currentContext) {
      throw new Error("No tenant context set");
    }

    if (!this.canCreateTransfer(request.fromTenantId, request.toTenantId)) {
      throw new Error("Insufficient permissions for transfer");
    }

    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transfers: TransferRequest[] = JSON.parse(
      localStorage.getItem("transferRequests") || "[]"
    );

    const newTransfer: TransferRequest = {
      ...request,
      id: transferId,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      requestedBy: this.currentContext.user.id
    };

    transfers.push(newTransfer);
    localStorage.setItem("transferRequests", JSON.stringify(transfers));

    this.logAudit("transfer_request", "transfer", transferId, {
      fromTenant: request.fromTenantId,
      toTenant: request.toTenantId,
      type: request.type,
      amount: request.amount
    });

    return transferId;
  }

  approveTransfer(transferId: string, approved: boolean, notes?: string): void {
    if (!this.currentContext) {
      throw new Error("No tenant context set");
    }

    const transfers: TransferRequest[] = JSON.parse(
      localStorage.getItem("transferRequests") || "[]"
    );

    const transferIndex = transfers.findIndex(t => t.id === transferId);
    if (transferIndex === -1) {
      throw new Error("Transfer not found");
    }

    const transfer = transfers[transferIndex];
    
    // Check if user can approve this transfer
    if (!this.canApproveTransfer(transfer)) {
      throw new Error("Insufficient permissions to approve transfer");
    }

    transfer.status = approved ? 'approved' : 'rejected';
    transfer.approvedBy = this.currentContext.user.id;
    transfer.approvedAt = new Date().toISOString();
    if (notes) transfer.notes = notes;

    transfers[transferIndex] = transfer;
    localStorage.setItem("transferRequests", JSON.stringify(transfers));

    this.logAudit("transfer_approval", "transfer", transferId, {
      approved,
      fromTenant: transfer.fromTenantId,
      toTenant: transfer.toTenantId,
      notes
    });

    // If approved, execute the transfer
    if (approved) {
      this.executeTransfer(transfer);
    }
  }

  private canApproveTransfer(transfer: TransferRequest): boolean {
    if (!this.currentContext) return false;

    const user = this.currentContext.user;
    
    // Master can approve any transfer
    if (user.role === "master") return true;

    // Central de compras can approve transfers they manage
    if (user.userType === "central_compras") {
      return this.canAccessTenant(user, transfer.fromTenantId) ||
             this.canAccessTenant(user, transfer.toTenantId);
    }

    // Diretor can approve transfers to their school
    if (user.userType === "diretor_escolar") {
      return transfer.toTenantId === this.currentContext.tenantId;
    }

    return false;
  }

  private executeTransfer(transfer: TransferRequest): void {
    try {
      if (transfer.type === 'balance') {
        this.executeBalanceTransfer(transfer);
      } else if (transfer.type === 'stock') {
        this.executeStockTransfer(transfer);
      }

      // Mark as completed
      const transfers: TransferRequest[] = JSON.parse(
        localStorage.getItem("transferRequests") || "[]"
      );
      const transferIndex = transfers.findIndex(t => t.id === transfer.id);
      if (transferIndex !== -1) {
        transfers[transferIndex].status = 'completed';
        transfers[transferIndex].completedAt = new Date().toISOString();
        localStorage.setItem("transferRequests", JSON.stringify(transfers));
      }

      this.logAudit("transfer_completed", "transfer", transfer.id, {
        fromTenant: transfer.fromTenantId,
        toTenant: transfer.toTenantId,
        type: transfer.type
      });
    } catch (error) {
      console.error("Error executing transfer:", error);
      throw new Error("Failed to execute transfer");
    }
  }

  private executeBalanceTransfer(transfer: TransferRequest): void {
    // Implementation for balance transfer between tenants
    // This would update bank accounts or receivables/payables
    console.log("Executing balance transfer:", transfer);
  }

  private executeStockTransfer(transfer: TransferRequest): void {
    // Implementation for stock transfer between tenants
    // This would create inventory movements
    console.log("Executing stock transfer:", transfer);
  }

  logAudit(action: string, resource: string, resourceId?: string, details?: any): void {
    if (!this.currentContext) return;

    const auditLogs: AuditLog[] = JSON.parse(localStorage.getItem("auditLogs") || "[]");
    
    const logEntry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.currentContext.user.id,
      userType: this.currentContext.user.userType,
      action,
      resource,
      resourceId,
      tenantId: this.currentContext.tenantId,
      targetTenantId: details?.targetTenant,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: "localhost", // In a real app, get actual IP
      userAgent: navigator.userAgent
    };

    auditLogs.push(logEntry);

    // Keep only last 1000 entries
    if (auditLogs.length > 1000) {
      auditLogs.splice(0, auditLogs.length - 1000);
    }

    localStorage.setItem("auditLogs", JSON.stringify(auditLogs));
  }

  clearContext(): void {
    this.currentContext = null;
    localStorage.removeItem("currentTenantId");
    dataIsolationService.clearContext();
  }

  getTenantById(tenantId: string): Tenant | null {
    const tenants: Tenant[] = JSON.parse(localStorage.getItem("tenants") || "[]");
    return tenants.find(t => t.id === tenantId) || null;
  }

  createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt'>): string {
    const tenants: Tenant[] = JSON.parse(localStorage.getItem("tenants") || "[]");
    
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: tenantId,
      createdAt: new Date().toISOString()
    };

    tenants.push(newTenant);
    localStorage.setItem("tenants", JSON.stringify(tenants));

    this.logAudit("tenant_created", "tenant", tenantId, tenantData);
    
    return tenantId;
  }
}

export const multiTenantService = new MultiTenantService();
