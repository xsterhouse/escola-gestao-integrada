import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Save, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for module permissions
interface ModulePermission {
  id: string;
  name: string;
  description: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

// Define types for user roles
interface UserRole {
  id: string;
  name: string;
  description: string;
}

export function PermissionsTab() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("modules");

  // Mock data for module permissions
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([
    {
      id: "1",
      name: "Dashboard",
      description: "Painel principal",
      create: true,
      read: true,
      update: true,
      delete: false
    },
    {
      id: "2",
      name: "Produtos",
      description: "Gestão de produtos",
      create: true,
      read: true,
      update: true,
      delete: true
    },
    {
      id: "3",
      name: "Estoque",
      description: "Controle de estoque",
      create: true,
      read: true,
      update: true,
      delete: false
    },
    {
      id: "4",
      name: "Financeiro",
      description: "Gestão financeira",
      create: true,
      read: true,
      update: true,
      delete: true
    },
    {
      id: "5",
      name: "Planejamento",
      description: "Planejamento escolar",
      create: true,
      read: true,
      update: true,
      delete: false
    },
    {
      id: "6",
      name: "Contratos",
      description: "Gestão de contratos",
      create: true,
      read: true,
      update: true,
      delete: true
    },
    {
      id: "7",
      name: "Contabilidade",
      description: "Gestão contábil",
      create: true,
      read: true,
      update: true,
      delete: false
    }
  ]);

  // Mock data for user roles
  const [userRoles, setUserRoles] = useState<UserRole[]>([
    {
      id: "1",
      name: "Administrador",
      description: "Acesso total ao sistema"
    },
    {
      id: "2",
      name: "Gerente",
      description: "Acesso a todos os módulos sem permissão de exclusão"
    },
    {
      id: "3",
      name: "Operador",
      description: "Acesso de leitura e escrita básica"
    },
    {
      id: "4",
      name: "Visualizador",
      description: "Acesso apenas de leitura"
    }
  ]);

  const handleTogglePermission = (moduleId: string, permission: "create" | "read" | "update" | "delete") => {
    setModulePermissions(prevPermissions => 
      prevPermissions.map(module => 
        module.id === moduleId
          ? { ...module, [permission]: !module[permission] }
          : module
      )
    );
  };

  const handleSavePermissions = () => {
    toast({
      title: "Permissões salvas",
      description: "As configurações de permissões foram atualizadas com sucesso."
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Permissões do Sistema</CardTitle>
        <CardDescription>
          Configure as permissões de acesso aos módulos do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger value="modules">Módulos do Sistema</TabsTrigger>
            <TabsTrigger value="roles">Perfis de Usuário</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules">
            <div>
              <div className="flex justify-end mb-4">
                <Button onClick={handleSavePermissions} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Permissões
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Criar</TableHead>
                    <TableHead className="text-center">Ler</TableHead>
                    <TableHead className="text-center">Editar</TableHead>
                    <TableHead className="text-center">Excluir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modulePermissions.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.name}</TableCell>
                      <TableCell>{module.description}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={module.create}
                            onCheckedChange={() => handleTogglePermission(module.id, "create")}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={module.read}
                            onCheckedChange={() => handleTogglePermission(module.id, "read")}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={module.update}
                            onCheckedChange={() => handleTogglePermission(module.id, "update")}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={module.delete}
                            onCheckedChange={() => handleTogglePermission(module.id, "delete")}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="roles">
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Configure os perfis de usuário padrão e suas permissões associadas.
              </p>
              
              {userRoles.map((role) => (
                <Card key={role.id} className="bg-slate-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#012340]" />
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {modulePermissions.map((module) => (
                        <div key={module.id} className="flex items-center space-x-2 bg-white p-2 rounded-md border">
                          <Switch id={`${role.id}-${module.id}`} />
                          <label htmlFor={`${role.id}-${module.id}`} className="text-sm font-medium cursor-pointer">
                            {module.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Permissões salvas", description: `Perfil ${role.name} atualizado.` })}>
                        Salvar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex justify-center">
                <Button variant="outline" className="mt-4" onClick={() => toast({ title: "Em desenvolvimento", description: "A criação de novos perfis estará disponível em breve." })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Perfil
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
