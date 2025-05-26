
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SystemUserForm } from "@/components/settings/SystemUserForm";
import { SystemUserEditModal } from "@/components/settings/SystemUserEditModal";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { saveUserPassword } from "@/contexts/AuthContext";
import { Eye, Pencil, Ban, ShieldCheck, Plus, User, Trash2, Building } from "lucide-react";

interface SystemUser {
  id: string;
  name: string;
  matricula: string;
  password: string;
  schoolId: string | null;
  isLinkedToPurchasing: boolean;
  purchasingCenterIds?: string[];
  status: "active" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

interface School {
  id: string;
  name: string;
}

interface PurchasingCenter {
  id: string;
  name: string;
  description: string;
  schoolIds: string[];
  status: "active" | "inactive";
}

export function SystemUsersTab() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  
  const { data: systemUsers, saveData: setSystemUsers } = useLocalStorageSync<SystemUser>('systemUsers', []);
  const { data: schools } = useLocalStorageSync<School>('schools', []);
  const { data: purchasingCenters } = useLocalStorageSync<PurchasingCenter>('purchasingCenters', []);

  const handleSaveUser = (userData: Omit<SystemUser, "id" | "createdAt" | "updatedAt">) => {
    const newUser: SystemUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`💾 Salvando usuário: ${newUser.name} com ID: ${newUser.id}`);
    console.log(`🔐 Salvando senha para usuário ID: ${newUser.id}`);
    
    // Salvar a senha no sistema de autenticação
    saveUserPassword(newUser.id, userData.password);
    
    // Verificar se a senha foi salva corretamente
    const passwords = JSON.parse(localStorage.getItem("userPasswords") || "{}");
    console.log(`✅ Senha salva: ${!!passwords[newUser.id]}`);
    
    const updatedUsers = [...systemUsers, newUser];
    setSystemUsers(updatedUsers);
    setIsModalOpen(false);
    
    toast({
      title: "Usuário criado",
      description: "O usuário do sistema foi criado com sucesso.",
    });
  };

  const handleEditUser = (userData: Partial<SystemUser>) => {
    if (!selectedUser) return;
    
    const updatedUsers = systemUsers.map(user => 
      user.id === selectedUser.id 
        ? { ...user, ...userData, updatedAt: new Date() } 
        : user
    );
    
    // Se a senha foi alterada, salvar no sistema de autenticação
    if (userData.password && userData.password !== selectedUser.password) {
      console.log(`🔐 Atualizando senha para usuário ID: ${selectedUser.id}`);
      saveUserPassword(selectedUser.id, userData.password);
    }
    
    setSystemUsers(updatedUsers);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    
    toast({
      title: "Usuário atualizado",
      description: "Os dados do usuário foram atualizados com sucesso.",
    });
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      const updatedUsers = systemUsers.filter(user => user.id !== id);
      setSystemUsers(updatedUsers);
      
      // Remover também a senha do sistema de autenticação
      const passwords = JSON.parse(localStorage.getItem("userPasswords") || "{}");
      delete passwords[id];
      localStorage.setItem("userPasswords", JSON.stringify(passwords));
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
    }
  };

  const handleToggleStatus = (id: string, newStatus: "active" | "blocked") => {
    const updatedUsers = systemUsers.map(user => 
      user.id === id 
        ? { ...user, status: newStatus, updatedAt: new Date() } 
        : user
    );
    setSystemUsers(updatedUsers);
    
    toast({ 
      title: newStatus === "active" ? "Usuário desbloqueado" : "Usuário bloqueado", 
      description: `O usuário foi ${newStatus === "active" ? "desbloqueado" : "bloqueado"} com sucesso.`
    });
  };

  const handleViewUser = (user: SystemUser) => {
    const school = schools.find(s => s.id === user.schoolId);
    const schoolName = school ? school.name : "Nenhuma escola vinculada";
    
    const userPurchasingCenters = user.purchasingCenterIds 
      ? purchasingCenters.filter(pc => user.purchasingCenterIds!.includes(pc.id))
      : [];
    
    const purchasingCenterNames = userPurchasingCenters.length > 0 
      ? userPurchasingCenters.map(pc => pc.name).join(", ")
      : "Nenhuma central vinculada";
    
    toast({
      title: "Detalhes do Usuário",
      description: `Nome: ${user.name}, Matrícula: ${user.matricula}, Escola: ${schoolName}, Centrais: ${purchasingCenterNames}`,
    });
  };

  const handleEditClick = (user: SystemUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const getSchoolName = (schoolId: string | null) => {
    if (!schoolId) return "Nenhuma escola";
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : "Escola não encontrada";
  };

  const getPurchasingCenterNames = (purchasingCenterIds?: string[]) => {
    if (!purchasingCenterIds || purchasingCenterIds.length === 0) {
      return "Nenhuma";
    }
    
    const userCenters = purchasingCenters.filter(pc => 
      purchasingCenterIds.includes(pc.id)
    );
    
    return userCenters.length > 0 
      ? userCenters.map(pc => pc.name).join(", ")
      : "Centrais não encontradas";
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            Gerencie os usuários do sistema. Total: {systemUsers.length}
          </CardDescription>
        </div>
        <Button 
          className="flex items-center gap-1"
          style={{ backgroundColor: '#012340', color: 'white' }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#013a5c';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#012340';
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead>Centrais de Compras</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {systemUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.
                </TableCell>
              </TableRow>
            ) : (
              systemUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="font-mono">{user.matricula}</TableCell>
                  <TableCell className="text-sm">{getSchoolName(user.schoolId)}</TableCell>
                  <TableCell className="text-sm max-w-48">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-gray-500" />
                      <span className="truncate">{getPurchasingCenterNames(user.purchasingCenterIds)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status === "active" ? "Ativo" : "Bloqueado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleViewUser(user)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEditClick(user)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {user.status === "active" ? (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id, "blocked")}
                        className="text-red-600 hover:text-red-700"
                        title="Bloquear"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id, "active")}
                        className="text-green-600 hover:text-green-700"
                        title="Desbloquear"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <SystemUserForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          schools={schools}
        />

        {selectedUser && (
          <SystemUserEditModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            onSave={handleEditUser}
            user={selectedUser}
            schools={schools}
          />
        )}
      </CardContent>
    </Card>
  );
}
