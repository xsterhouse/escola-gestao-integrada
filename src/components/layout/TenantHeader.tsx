
import React from "react";
import { Building2, Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TenantSelector } from "@/components/tenant/TenantSelector";
import { useAuth } from "@/contexts/AuthContext";

export function TenantHeader() {
  const { user, currentTenant, availableTenants, switchTenant } = useAuth();

  if (!user || !currentTenant) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {currentTenant.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Organização atual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white">
                <Users className="h-3 w-3 mr-1" />
                {user.userType === "master" ? "Master" :
                 user.userType === "diretor_escolar" ? "Diretor" :
                 user.userType === "central_compras" ? "Central" :
                 user.userType === "secretario" ? "Secretário" : "Funcionário"}
              </Badge>

              <Badge variant="outline" className="bg-white">
                <Shield className="h-3 w-3 mr-1" />
                {user.dataScope === "global" ? "Global" :
                 user.dataScope === "purchasing_center" ? "Multi-Escola" : "Escola"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {availableTenants.length > 1 && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-500 font-medium">
                  Trocar organização:
                </span>
                <TenantSelector
                  tenants={availableTenants}
                  currentTenantId={currentTenant.id}
                  onTenantChange={switchTenant}
                />
              </div>
            )}

            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.name}
              </p>
              <p className="text-xs text-gray-600">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {currentTenant.settings && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${currentTenant.settings.allowTransfers ? 'bg-green-400' : 'bg-red-400'}`}></span>
                Transferências {currentTenant.settings.allowTransfers ? 'Permitidas' : 'Bloqueadas'}
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${currentTenant.settings.requireApproval ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                {currentTenant.settings.requireApproval ? 'Aprovação Obrigatória' : 'Aprovação Automática'}
              </span>
              <span>
                Máx. {currentTenant.settings.maxUsers} usuários
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
