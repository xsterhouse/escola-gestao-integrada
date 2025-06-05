
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Plus, Edit, Trash2, FileText } from "lucide-react";

interface ModuleAccessMatrixProps {
  hierarchyLevels: any[];
  onUpdate: (moduleId: string, permissions: any) => void;
}

const systemModules = [
  { id: "1", name: "Dashboard", description: "Painel principal do sistema", icon: "📊" },
  { id: "2", name: "Produtos", description: "Gestão de produtos e catálogo", icon: "📦" },
  { id: "3", name: "Estoque", description: "Controle de estoque e movimentações", icon: "📋" },
  { id: "4", name: "Financeiro", description: "Gestão financeira e contas", icon: "💰" },
  { id: "5", name: "Planejamento", description: "Planejamento escolar e ATAs", icon: "📅" },
  { id: "6", name: "Contratos", description: "Gestão de contratos e licitações", icon: "📝" },
  { id: "7", name: "Contabilidade", description: "Gestão contábil avançada", icon: "🧮" },
  { id: "8", name: "Configurações", description: "Configurações do sistema", icon: "⚙️" }
];

export function ModuleAccessMatrix({ hierarchyLevels, onUpdate }: ModuleAccessMatrixProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredModules = systemModules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasModuleAccess = (moduleId: string, hierarchyType: string) => {
    const level = hierarchyLevels.find(l => l.type === hierarchyType);
    return level?.config.allowedModules.includes(moduleId) || false;
  };

  const getPermissionBadge = (moduleId: string, hierarchyType: string) => {
    if (!hasModuleAccess(moduleId, hierarchyType)) {
      return <Badge variant="destructive">Sem Acesso</Badge>;
    }

    const level = hierarchyLevels.find(l => l.type === hierarchyType);
    const restrictions = level?.config.restrictions[0] || {};

    if (restrictions.readOnly) {
      return <Badge variant="secondary">Somente Leitura</Badge>;
    }

    return <Badge variant="default">Acesso Completo</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Matrix de Acesso aos Módulos</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar módulos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Master</TableHead>
                  <TableHead>Diretor</TableHead>
                  <TableHead>Secretário</TableHead>
                  <TableHead>Central</TableHead>
                  <TableHead>Funcionário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{module.icon}</span>
                        <div>
                          <div className="font-medium">{module.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {module.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    {hierarchyLevels.map((level) => (
                      <TableCell key={level.type}>
                        <div className="flex flex-col gap-2">
                          <Switch
                            checked={hasModuleAccess(module.id, level.type)}
                            disabled={level.type === "master"} // Master sempre tem acesso
                            onCheckedChange={(checked) => {
                              const currentModules = level.config.allowedModules;
                              const newModules = checked 
                                ? [...currentModules, module.id]
                                : currentModules.filter((id: string) => id !== module.id);
                              
                              onUpdate(module.id, {
                                ...level.config,
                                allowedModules: newModules
                              });
                            }}
                          />
                          {getPermissionBadge(module.id, level.type)}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ações Detalhadas por Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualizar
              </h4>
              <p className="text-sm text-muted-foreground">
                Permissão para visualizar dados do módulo
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar
              </h4>
              <p className="text-sm text-muted-foreground">
                Permissão para criar novos registros
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </h4>
              <p className="text-sm text-muted-foreground">
                Permissão para modificar registros existentes
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir
              </h4>
              <p className="text-sm text-muted-foreground">
                Permissão para remover registros
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
