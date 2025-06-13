
import React from "react";
import { Building2, Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TenantSelector } from "@/components/tenant/TenantSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export function TenantHeader() {
  const { user, currentTenant, availableTenants, switchTenant } = useAuth();
  const isMobile = useIsMobile();

  if (!user || !currentTenant) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-4'}`}>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
              </div>
              <div>
                <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : ''}`}>
                  {currentTenant.name}
                </h3>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Organização atual
                </p>
              </div>
            </div>

            <div className={`flex ${isMobile ? 'flex-wrap' : 'items-center'} gap-2`}>
              <Badge variant="outline" className={`bg-white ${isMobile ? 'text-xs' : ''}`}>
                <Users className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
                {user.userType === "master" ? "Master" :
                 user.userType === "diretor_escolar" ? "Diretor" :
                 user.userType === "central_compras" ? "Central" :
                 user.userType === "secretario" ? "Secretário" : "Funcionário"}
              </Badge>

              <Badge variant="outline" className={`bg-white ${isMobile ? 'text-xs' : ''}`}>
                <Shield className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
                {user.dataScope === "global" ? "Global" :
                 user.dataScope === "purchasing_center" ? "Multi-Escola" : "Escola"}
              </Badge>
            </div>
          </div>

          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-4'}`}>
            {availableTenants.length > 1 && (
              <div className={`flex ${isMobile ? 'flex-col items-start' : 'flex-col items-end'} gap-1`}>
                <span className={`text-gray-500 font-medium ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  Trocar organização:
                </span>
                <TenantSelector
                  tenants={availableTenants}
                  currentTenantId={currentTenant.id}
                  onTenantChange={switchTenant}
                />
              </div>
            )}

            <div className={`${isMobile ? 'text-left' : 'text-right'}`}>
              <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                {user.name}
              </p>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {currentTenant.settings && (
          <div className={`pt-3 border-t border-gray-200 ${isMobile ? 'mt-2' : 'mt-3'}`}>
            <div className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-4'} text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
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
