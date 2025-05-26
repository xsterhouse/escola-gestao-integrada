import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Save, Plus, Trash2, Pencil, Users, Settings, Filter, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModulePermission, UserRole } from "@/lib/types";
import { DetailedPermission } from "@/types/user";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { RolePermissionsEditor } from "./RolePermissionsEditor";

interface SystemUser {
  id: string;
  name: string;
  matricula: string;
  schoolId: string | null;
  purchasingCenterIds?: string[];
  status: "active" | "blocked";
}

interface User {
  id: string;
  name: string;
  matricula: string;
  email: string;
  role: string;
  schoolId: string | null;
  permissions: Array<{ id: string; name: string; hasAccess: boolean }>;
  status?: "active" | "inactive";
}

interface School {
  id: string;
  name: string;
}

interface PurchasingCenter {
  id: string;
  name: string;
  schoolIds: string[];
}

interface UserModulePermission {
  userId: string;
  moduleId: string;
  hasAccess: boolean;
  restrictions?: {
    schoolOnly?: boolean;
    purchasingCenterOnly?: boolean;
    readOnly?: boolean;
  };
}

export function PermissionsTab() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("modules");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [filterBySchool, setFilterBySchool] = useState<string>("all");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Use localStorage for persistence
  const { data: modulePermissions, saveData: setModulePermissions } = useLocalStorageSync<ModulePermission>('modulePermissions', [
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
    },
    {
      id: "8",
      name: "Configurações",
      description: "Configurações do sistema",
      create: false,
      read: true,
      update: false,
      delete: false
    }
  ]);

  const { data: userRoles, saveData: setUserRoles } = useLocalStorageSync<UserRole>('userRoles', [
    {
      id: "1",
      name: "Administrador",
      description: "Acesso total ao sistema",
      detailedPermissions: []
    },
    {
      id: "2",
      name: "Gerente",
      description: "Acesso a todos os módulos sem permissão de exclusão",
      detailedPermissions: []
    },
    {
      id: "3",
      name: "Operador",
      description: "Acesso de leitura e escrita básica",
      detailedPermissions: []
    },
    {
      id: "4",
      name: "Visualizador",
      description: "Acesso apenas de leitura",
      detailedPermissions: []
    }
  ]);

  // Load system users and regular users
  const { data: systemUsers } = useLocalStorageSync<SystemUser>('systemUsers', []);
  const { data: users } = useLocalStorageSync<User>('users', []);
  const { data: schools } = useLocalStorageSync<School>('schools', []);
  const { data: purchasingCenters } = useLocalStorageSync<PurchasingCenter>('purchasingCenters', []);

  // User permissions state
  const { data: userPermissions, saveData: setUserPermissions } = useLocalStorageSync<UserModulePermission>('userModulePermissions', []);

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: ""
  });

  // Store role permissions (combination of roles and modules) in localStorage
  const [rolePermissions, setRolePermissions] = useState<{
    [roleId: string]: {
      [moduleId: string]: boolean;
    }
  }>({});

  // Load role permissions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('rolePermissions');
    if (stored) {
      try {
        setRolePermissions(JSON.parse(stored));
      } catch (error) {
        console.error("Erro ao carregar permissões dos perfis:", error);
        // Initialize with default values
        const defaultPermissions = {
          "1": { "1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true },
          "2": { "1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": false, "8": false },
          "3": { "1": true, "2": true, "3": true, "4": false, "5": false, "6": false, "7": false, "8": false },
          "4": { "1": true, "2": false, "3": false, "4": false, "5": false, "6": false, "7": false, "8": false }
        };
        setRolePermissions(defaultPermissions);
        localStorage.setItem('rolePermissions', JSON.stringify(defaultPermissions));
      }
    } else {
      // Initialize with default values
      const defaultPermissions = {
        "1": { "1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": true, "8": true },
        "2": { "1": true, "2": true, "3": true, "4": true, "5": true, "6": true, "7": false, "8": false },
        "3": { "1": true, "2": true, "3": true, "4": false, "5": false, "6": false, "7": false, "8": false },
        "4": { "1": true, "2": false, "3": false, "4": false, "5": false, "6": false, "7": false, "8": false }
      };
      setRolePermissions(defaultPermissions);
      localStorage.setItem('rolePermissions', JSON.stringify(defaultPermissions));
    }
  }, []);

  // Save role permissions to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  // Combine all users (system users + regular users)
  const allUsers = [
    ...systemUsers.map(u => ({ ...u, type: 'system' as const })),
    ...users.map(u => ({ ...u, type: 'regular' as const }))
  ];

  // Filter users by school if selected
  const filteredUsers = filterBySchool === "all" 
    ? allUsers 
    : allUsers.filter(user => user.schoolId === filterBySchool);

  const getSchoolName = (schoolId: string | null) => {
    if (!schoolId) return "Todas as escolas";
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : "Escola não encontrada";
  };

  const getPurchasingCentersNames = (centerIds?: string[]) => {
    if (!centerIds || centerIds.length === 0) return "Nenhuma";
    
    const centerNames = purchasingCenters
      .filter(pc => centerIds.includes(pc.id))
      .map(pc => pc.name);
    
    return centerNames.length > 0 ? centerNames.join(", ") : "Nenhuma";
  };

  const getUserPermission = (userId: string, moduleId: string) => {
    return userPermissions.find(p => p.userId === userId && p.moduleId === moduleId);
  };

  const handleToggleUserPermission = (userId: string, moduleId: string) => {
    const existingPermission = getUserPermission(userId, moduleId);
    
    if (existingPermission) {
      // Update existing permission
      const updatedPermissions = userPermissions.map(p => 
        p.userId === userId && p.moduleId === moduleId
          ? { ...p, hasAccess: !p.hasAccess }
          : p
      );
      setUserPermissions(updatedPermissions);
    } else {
      // Create new permission
      const newPermission: UserModulePermission = {
        userId,
        moduleId,
        hasAccess: true,
        restrictions: {}
      };
      setUserPermissions([...userPermissions, newPermission]);
    }
  };

  const handleTogglePermission = (moduleId: string, permission: "create" | "read" | "update" | "delete") => {
    const updatedPermissions = modulePermissions.map(module => 
      module.id === moduleId
        ? { ...module, [permission]: !module[permission] }
        : module
    );
    setModulePermissions(updatedPermissions);
  };

  const handleSavePermissions = () => {
    toast({
      title: "Permissões salvas",
      description: "As configurações de permissões foram atualizadas com sucesso."
    });
  };

  const handleSaveUserPermissions = () => {
    toast({
      title: "Permissões de usuário salvas",
      description: "As permissões específicas do usuário foram atualizadas com sucesso."
    });
  };

  const handleUpdateRolePermissions = (roleId: string, permissions: DetailedPermission[]) => {
    const updatedRoles = userRoles.map(role => 
      role.id === roleId
        ? { ...role, detailedPermissions: permissions }
        : role
    );
    setUserRoles(updatedRoles);
    
    toast({
      title: "Permissões atualizadas",
      description: `As permissões do perfil foram atualizadas com sucesso.`
    });
  };

  const handleCloneRole = (role: UserRole) => {
    const clonedRole: UserRole = {
      id: Date.now().toString(),
      name: `${role.name} (Cópia)`,
      description: `${role.description} (Cópia)`,
      detailedPermissions: role.detailedPermissions ? [...role.detailedPermissions] : []
    };
    
    setUserRoles([...userRoles, clonedRole]);
    
    toast({
      title: "Perfil clonado",
      description: "O perfil foi clonado com sucesso."
    });
  };

  const getPermissionsSummary = (role: UserRole) => {
    if (!role.detailedPermissions || role.detailedPermissions.length === 0) {
      return "Nenhuma permissão configurada";
    }
    
    const activeModules = role.detailedPermissions.filter(p => 
      p.view || p.create || p.edit || p.delete || p.read
    ).length;
    
    return `${activeModules} módulos com permissões configuradas`;
  };

  const handleOpenRoleModal = (role?: UserRole) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        description: role.description
      });
    } else {
      setEditingRole(null);
      setRoleForm({
        name: "",
        description: ""
      });
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleForm.name) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do perfil é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (editingRole) {
      // Update existing role
      const updatedRoles = userRoles.map(role => 
        role.id === editingRole.id
          ? { ...role, name: roleForm.name, description: roleForm.description }
          : role
      );
      setUserRoles(updatedRoles);
      toast({
        title: "Perfil atualizado",
        description: "O perfil foi atualizado com sucesso."
      });
    } else {
      // Create new role
      const newRole: UserRole = {
        id: Date.now().toString(),
        name: roleForm.name,
        description: roleForm.description,
        detailedPermissions: []
      };
      setUserRoles([...userRoles, newRole]);
      
      toast({
        title: "Perfil criado",
        description: "O novo perfil foi criado com sucesso."
      });
    }
    
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.")) {
      const updatedRoles = userRoles.filter(role => role.id !== roleId);
      setUserRoles(updatedRoles);
      
      // Clean up role permissions
      const newRolePermissions = { ...rolePermissions };
      delete newRolePermissions[roleId];
      setRolePermissions(newRolePermissions);
      
      toast({
        title: "Perfil excluído",
        description: "O perfil foi excluído com sucesso."
      });
    }
  };

  const handleToggleRolePermission = (roleId: string, moduleId: string) => {
    const newRolePermissions = {
      ...rolePermissions,
      [roleId]: {
        ...rolePermissions[roleId],
        [moduleId]: !rolePermissions[roleId]?.[moduleId]
      }
    };
    setRolePermissions(newRolePermissions);
  };

  const handleSaveRolePermissions = (roleId: string) => {
    toast({ 
      title: "Permissões salvas", 
      description: `Perfil ${userRoles.find(r => r.id === roleId)?.name} atualizado.` 
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Permissões do Sistema</CardTitle>
        <CardDescription>
          Configure as permissões de acesso aos módulos do sistema por usuário, perfil e afiliação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="modules">Módulos do Sistema</TabsTrigger>
            <TabsTrigger value="users">Permissões por Usuário</TabsTrigger>
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

          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Total de usuários: {allUsers.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <Select value={filterBySchool} onValueChange={setFilterBySchool}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por escola" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as escolas</SelectItem>
                        {schools.map(school => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveUserPermissions} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Permissões
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Escola</TableHead>
                      <TableHead>Central de Compras</TableHead>
                      {modulePermissions.map(module => (
                        <TableHead key={module.id} className="text-center min-w-[100px]">
                          {module.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={`${user.type}-${user.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.matricula}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.type === 'system' ? 'default' : 'secondary'}>
                            {user.type === 'system' ? 'Sistema' : 'Regular'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getSchoolName(user.schoolId)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.type === 'system' && 'purchasingCenterIds' in user 
                            ? getPurchasingCentersNames(user.purchasingCenterIds)
                            : 'N/A'
                          }
                        </TableCell>
                        {modulePermissions.map(module => {
                          const permission = getUserPermission(user.id, module.id);
                          const hasAccess = permission ? permission.hasAccess : false;
                          
                          return (
                            <TableCell key={module.id} className="text-center">
                              <Switch
                                checked={hasAccess}
                                onCheckedChange={() => handleToggleUserPermission(user.id, module.id)}
                                disabled={
                                  // Configurações só para master
                                  (module.name === 'Configurações' && user.type !== 'system') ||
                                  // Contabilidade restrita para alguns perfis
                                  (module.name === 'Contabilidade' && user.type === 'system' && user.schoolId !== null)
                                }
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado para o filtro selecionado.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="roles">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Configure os perfis de usuário padrão e suas permissões associadas.
                </p>
                <Button variant="outline" onClick={() => handleOpenRoleModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Perfil
                </Button>
              </div>
              
              <div className="grid gap-4">
                {userRoles.map((role) => (
                  <div key={role.id}>
                    <Card className="bg-slate-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-[#012340]" />
                            <CardTitle className="text-lg">{role.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleCloneRole(role)}
                              title="Clonar perfil"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenRoleModal(role)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                            >
                              {expandedRole === role.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <CardDescription>{role.description}</CardDescription>
                        <div className="mt-2">
                          <Badge variant="outline">
                            {getPermissionsSummary(role)}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                    
                    {expandedRole === role.id && (
                      <RolePermissionsEditor
                        role={role}
                        onUpdate={handleUpdateRolePermissions}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Editar Perfil" : "Novo Perfil"}
              </DialogTitle>
              <DialogDescription>
                {editingRole 
                  ? "Edite as informações do perfil de usuário." 
                  : "Crie um novo perfil de usuário no sistema."}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSaveRole}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Nome do Perfil *</Label>
                  <Input
                    id="roleName"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Gerente Financeiro"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roleDescription">Descrição</Label>
                  <Input
                    id="roleDescription"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: Acesso ao módulo financeiro e relatórios"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingRole ? "Atualizar" : "Criar Perfil"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
