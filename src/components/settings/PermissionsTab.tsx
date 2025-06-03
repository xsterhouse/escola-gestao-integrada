import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ModulePermission } from "@/lib/types";

export function PermissionsTab() {
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load permissions from localStorage on component mount
    const storedPermissions = localStorage.getItem('modulePermissions');
    if (storedPermissions) {
      setPermissions(JSON.parse(storedPermissions));
    } else {
      // Initialize with default permissions if nothing is stored
      setPermissions(modulePermissions);
    }
  }, []);

  useEffect(() => {
    // Save permissions to localStorage whenever permissions state changes
    localStorage.setItem('modulePermissions', JSON.stringify(permissions));
  }, [permissions]);

  const updatePermission = (id: string, hasAccess: boolean) => {
    const updatedPermissions = permissions.map(permission =>
      permission.id === id ? { ...permission, hasAccess } : permission
    );
    setPermissions(updatedPermissions);

    toast({
      title: "Permissões atualizadas",
      description: `Permissão de acesso ao módulo "${updatedPermissions.find(p => p.id === id)?.name}" ${hasAccess ? 'concedida' : 'revogada'}.`,
    });
  };

  const modulePermissions: ModulePermission[] = [
    { id: "dashboard", name: "Dashboard", description: "Acesso ao painel principal", hasAccess: true, create: true, read: true, update: true, delete: false },
    { id: "planning", name: "Planejamento", description: "Gestão de planejamentos e ATAs", hasAccess: true, create: true, read: true, update: true, delete: true },
    { id: "inventory", name: "Estoque", description: "Controle de estoque e movimentações", hasAccess: true, create: true, read: true, update: true, delete: false },
    { id: "financial", name: "Financeiro", description: "Gestão financeira e contas", hasAccess: true, create: true, read: true, update: true, delete: true },
    { id: "contracts", name: "Contratos", description: "Gestão de contratos e licitações", hasAccess: true, create: true, read: true, update: true, delete: false },
    { id: "users", name: "Usuários", description: "Gestão de usuários do sistema", hasAccess: true, create: true, read: true, update: true, delete: true },
    { id: "products", name: "Produtos", description: "Cadastro e gestão de produtos", hasAccess: true, create: true, read: true, update: true, delete: false },
    { id: "settings", name: "Configurações", description: "Configurações do sistema", hasAccess: true, create: false, read: true, update: false, delete: false },
  ];

  return (
    <div className="grid gap-4">
      {modulePermissions.map((permission) => (
        <Card key={permission.id}>
          <CardHeader>
            <CardTitle>{permission.name}</CardTitle>
            <CardDescription>{permission.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={permission.id}>Acesso ao módulo</Label>
              <Switch
                id={permission.id}
                checked={permissions.find(p => p.id === permission.id)?.hasAccess ?? permission.hasAccess}
                onCheckedChange={(checked) => updatePermission(permission.id, checked)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
