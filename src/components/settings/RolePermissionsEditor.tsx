
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Settings } from "lucide-react";
import { UserRole, DetailedPermission } from "@/types/user";

interface RolePermissionsEditorProps {
  role: UserRole;
  onUpdate: (roleId: string, permissions: DetailedPermission[]) => void;
}

const systemModules = [
  { id: "1", name: "Dashboard", description: "Painel principal" },
  { id: "2", name: "Produtos", description: "Gestão de produtos" },
  { id: "3", name: "Estoque", description: "Controle de estoque" },
  { id: "4", name: "Financeiro", description: "Gestão financeira" },
  { id: "5", name: "Planejamento", description: "Planejamento escolar" },
  { id: "6", name: "Contratos", description: "Gestão de contratos" },
  { id: "7", name: "Contabilidade", description: "Gestão contábil" },
  { id: "8", name: "Configurações", description: "Configurações do sistema" }
];

export function RolePermissionsEditor({ role, onUpdate }: RolePermissionsEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState<DetailedPermission[]>(
    role.detailedPermissions || systemModules.map(module => ({
      moduleId: module.id,
      moduleName: module.name,
      view: false,
      create: false,
      edit: false,
      delete: false,
      read: false
    }))
  );

  const filteredModules = systemModules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionForModule = (moduleId: string) => {
    return permissions.find(p => p.moduleId === moduleId) || {
      moduleId,
      moduleName: systemModules.find(m => m.id === moduleId)?.name || "",
      view: false,
      create: false,
      edit: false,
      delete: false,
      read: false
    };
  };

  const updatePermission = (moduleId: string, action: keyof Omit<DetailedPermission, 'moduleId' | 'moduleName'>, value: boolean) => {
    const updatedPermissions = permissions.map(p => 
      p.moduleId === moduleId 
        ? { ...p, [action]: value }
        : p
    );
    
    // If permission doesn't exist, create it
    if (!permissions.find(p => p.moduleId === moduleId)) {
      const moduleName = systemModules.find(m => m.id === moduleId)?.name || "";
      updatedPermissions.push({
        moduleId,
        moduleName,
        view: action === 'view' ? value : false,
        create: action === 'create' ? value : false,
        edit: action === 'edit' ? value : false,
        delete: action === 'delete' ? value : false,
        read: action === 'read' ? value : false
      });
    }

    setPermissions(updatedPermissions);
  };

  const handleSave = () => {
    onUpdate(role.id, permissions);
  };

  const getActivePermissionsCount = (moduleId: string) => {
    const perm = getPermissionForModule(moduleId);
    return [perm.view, perm.create, perm.edit, perm.delete, perm.read].filter(Boolean).length;
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Permissões do Perfil: {role.name}
          </CardTitle>
          <Button onClick={handleSave} size="sm">
            Salvar Permissões
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por módulo ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Ver</TableHead>
                <TableHead className="text-center">Criar</TableHead>
                <TableHead className="text-center">Editar</TableHead>
                <TableHead className="text-center">Excluir</TableHead>
                <TableHead className="text-center">Ler</TableHead>
                <TableHead className="text-center">Resumo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.map((module) => {
                const permission = getPermissionForModule(module.id);
                const activeCount = getActivePermissionsCount(module.id);
                
                return (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{module.description}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={permission.view}
                        onCheckedChange={(checked) => updatePermission(module.id, 'view', checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={permission.create}
                        onCheckedChange={(checked) => updatePermission(module.id, 'create', checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={permission.edit}
                        onCheckedChange={(checked) => updatePermission(module.id, 'edit', checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={permission.delete}
                        onCheckedChange={(checked) => updatePermission(module.id, 'delete', checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={permission.read}
                        onCheckedChange={(checked) => updatePermission(module.id, 'read', checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={activeCount > 0 ? "default" : "secondary"}>
                        {activeCount}/5
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {filteredModules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum módulo encontrado para o termo pesquisado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
