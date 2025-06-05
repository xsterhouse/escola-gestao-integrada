
import { User, UserHierarchy } from "@/lib/types";

export interface DataIsolationContext {
  userId: string;
  userType: UserHierarchy;
  schoolId: string | null;
  purchasingCenterIds?: string[];
  hierarchyLevel: number;
  dataScope: "school" | "purchasing_center" | "global";
}

class DataIsolationService {
  private context: DataIsolationContext | null = null;

  setContext(user: User) {
    this.context = {
      userId: user.id,
      userType: user.userType,
      schoolId: user.schoolId,
      purchasingCenterIds: user.purchasingCenterIds,
      hierarchyLevel: user.hierarchyLevel,
      dataScope: user.dataScope || "school"
    };
  }

  clearContext() {
    this.context = null;
  }

  getStorageKey(baseKey: string): string {
    if (!this.context) return baseKey;

    switch (this.context.dataScope) {
      case "global":
        return baseKey; // Master users see all data
      case "school":
        return this.context.schoolId ? `${baseKey}_school_${this.context.schoolId}` : baseKey;
      case "purchasing_center":
        return this.context.purchasingCenterIds?.length 
          ? `${baseKey}_pc_${this.context.purchasingCenterIds[0]}` 
          : baseKey;
      default:
        return baseKey;
    }
  }

  filterData<T extends { schoolId?: string; purchasingCenterId?: string }>(data: T[]): T[] {
    if (!this.context || this.context.dataScope === "global") {
      return data; // Master users see all data
    }

    return data.filter(item => {
      switch (this.context!.dataScope) {
        case "school":
          return item.schoolId === this.context!.schoolId;
        case "purchasing_center":
          return this.context!.purchasingCenterIds?.includes(item.purchasingCenterId || "");
        default:
          return true;
      }
    });
  }

  canAccessData(targetSchoolId?: string, targetPurchasingCenterId?: string): boolean {
    if (!this.context) return false;
    
    // Master users can access everything
    if (this.context.hierarchyLevel === 1) return true;

    switch (this.context.dataScope) {
      case "school":
        return targetSchoolId === this.context.schoolId;
      case "purchasing_center":
        return this.context.purchasingCenterIds?.includes(targetPurchasingCenterId || "") || false;
      case "global":
        return true;
      default:
        return false;
    }
  }

  canCreateUser(targetUserType: UserHierarchy, targetSchoolId?: string): boolean {
    if (!this.context) return false;

    // Master can create anyone
    if (this.context.hierarchyLevel === 1) return true;

    // Diretor can create users in their school
    if (this.context.userType === "diretor_escolar" && this.context.schoolId === targetSchoolId) {
      return ["secretario", "funcionario", "central_compras"].includes(targetUserType);
    }

    return false;
  }

  canManageUser(targetUserId: string, targetHierarchyLevel: number): boolean {
    if (!this.context) return false;

    // Can't manage users at same or higher level (except master)
    if (this.context.hierarchyLevel >= targetHierarchyLevel && this.context.hierarchyLevel !== 1) {
      return false;
    }

    // Master can manage everyone
    if (this.context.hierarchyLevel === 1) return true;

    // Diretor can manage school users
    if (this.context.userType === "diretor_escolar") {
      return targetHierarchyLevel > 2; // Can manage secretario and funcionario
    }

    return false;
  }

  getAvailableModules(): string[] {
    if (!this.context) return [];

    const modulesByHierarchy: Record<UserHierarchy, string[]> = {
      master: ["1", "2", "3", "4", "5", "6", "7", "8"], // All modules
      diretor_escolar: ["1", "2", "3", "4", "5", "6", "8"], // All except accounting
      secretario: ["1", "2", "3", "4", "5"], // Basic operations
      funcionario: ["1", "2", "3"], // Limited access
      central_compras: ["1", "2", "3", "4", "6"] // Purchasing focused
    };

    return modulesByHierarchy[this.context.userType] || [];
  }

  logDataAccess(action: string, dataType: string, targetId?: string) {
    if (!this.context) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: this.context.userId,
      userType: this.context.userType,
      action,
      dataType,
      targetId,
      schoolId: this.context.schoolId,
      purchasingCenterIds: this.context.purchasingCenterIds
    };

    // Store audit log
    const logs = JSON.parse(localStorage.getItem("audit_logs") || "[]");
    logs.push(logEntry);
    
    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem("audit_logs", JSON.stringify(logs));
  }
}

export const dataIsolationService = new DataIsolationService();
