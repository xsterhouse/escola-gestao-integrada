
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { HierarchyPermissionsEditor } from "./HierarchyPermissionsEditor";
import { ModuleAccessMatrix } from "./ModuleAccessMatrix";
import { DataIsolationConfig } from "./DataIsolationConfig";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Lock, Settings } from "lucide-react";

export function PermissionsTab() {
  const { toast } = useToast();
  const { getHierarchyConfig } = useUserPermissions();
  const [activeTab, setActiveTab] = useState("hierarchy");

  const hierarchyLevels = [
    { type: "master", config: getHierarchyConfig("master") },
    { type: "diretor_escolar", config: getHierarchyConfig("diretor_escolar") },
    { type: "secretario", config: getHierarchyConfig("secretario") },
    { type: "central_compras", config: getHierarchyConfig("central_compras") },
    { type: "funcionario", config: getHierarchyConfig("funcionario") }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Permissões do Sistema Multi-Tenant
        </h2>
        <p className="text-muted-foreground">
          Configure a hierarquia de usuários e o isolamento de dados entre escolas e centrais de compras.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {hierarchyLevels.map((level) => (
          <Card key={level.type} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {level.config.name}
              </CardTitle>
              <Badge variant="outline" className="w-fit">
                Nível {level.config.level}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                {level.config.description}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  {level.config.canCreateUsers ? "Pode criar usuários" : "Não cria usuários"}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  Escopo: {level.config.dataScope}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Settings className="h-3 w-3" />
                  {level.config.allowedModules.length} módulos
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="hierarchy">Hierarquia de Usuários</TabsTrigger>
          <TabsTrigger value="modules">Módulos por Tipo</TabsTrigger>
          <TabsTrigger value="isolation">Isolamento de Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="mt-6">
          <HierarchyPermissionsEditor 
            hierarchyLevels={hierarchyLevels}
            onUpdate={(type, permissions) => {
              toast({
                title: "Hierarquia atualizada",
                description: `Permissões do ${type} foram atualizadas com sucesso.`,
              });
            }}
          />
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
          <ModuleAccessMatrix 
            hierarchyLevels={hierarchyLevels}
            onUpdate={(moduleId, permissions) => {
              toast({
                title: "Módulo atualizado",
                description: `Permissões do módulo foram atualizadas com sucesso.`,
              });
            }}
          />
        </TabsContent>

        <TabsContent value="isolation" className="mt-6">
          <DataIsolationConfig 
            onUpdate={(config) => {
              toast({
                title: "Isolamento configurado",
                description: "Configurações de isolamento de dados atualizadas.",
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
