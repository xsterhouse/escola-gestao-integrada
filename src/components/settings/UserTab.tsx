import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, School } from "@/lib/types";
import { ModernUserForm } from "@/components/settings/ModernUserForm";
import { PasswordModal } from "@/components/settings/PasswordModal";
import { UserDetailsModal } from "@/components/settings/UserDetailsModal";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { Eye, Pencil, Trash2, Ban, ShieldCheck, Plus, Lock, Key } from "lucide-react";

export function UserTab() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Usar hook de sincronização para users e schools
  const { data: users, saveData: setUsers } = useLocalStorageSync<User>('users', []);
  const { data: schools } = useLocalStorageSync<School>('schools', []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setCurrentUser(user);
      setIsEditMode(true);
    } else {
      setCurrentUser(null);
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (isEditMode && currentUser) {
      // Update existing user
      const updatedUsers = users.map(u => 
        u.id === currentUser.id 
          ? { ...currentUser, ...userData, updatedAt: new Date() } 
          : u
      );
      setUsers(updatedUsers);
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || "",
        matricula: userData.matricula || "",
        email: userData.email || "",
        role: userData.role || "user",
        schoolId: userData.schoolId || null,
        permissions: userData.permissions || [],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      
      console.log(`✅ Novo usuário criado: ${userData.name} - Total: ${updatedUsers.length}`);
    }
    setIsModalOpen(false);
    
    toast({
      title: isEditMode ? "Usuário atualizado" : "Usuário cadastrado",
      description: isEditMode 
        ? "O usuário foi atualizado com sucesso." 
        : "O usuário foi cadastrado com sucesso.",
    });
  };

  const handleToggleStatus = (id: string, newStatus: "active" | "inactive") => {
    const updatedUsers = users.map(user => 
      user.id === id 
        ? { ...user, status: newStatus, updatedAt: new Date() } 
        : user
    );
    setUsers(updatedUsers);
    
    toast({ 
      title: newStatus === "active" ? "Usuário ativado" : "Usuário desativado", 
      description: `O status do usuário foi alterado para ${newStatus === "active" ? "ativo" : "inativo"}.`
    });
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    toast({ 
      title: "Usuário excluído", 
      description: "O usuário foi removido do sistema permanentemente."
    });
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleBlockUser = (id: string) => {
    toast({ 
      title: "Usuário bloqueado", 
      description: "O usuário foi bloqueado temporariamente."
    });
  };

  const handleSetPassword = (user: User) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = (password: string) => {
    if (selectedUser) {
      console.log(`Setting password for user ${selectedUser.name}`);
      setIsPasswordModalOpen(false);
      setSelectedUser(null);
      toast({
        title: "Senha definida",
        description: "A senha do usuário foi definida com sucesso.",
      });
    }
  };

  const getSchoolName = (schoolId: string | null) => {
    if (!schoolId) return "Todas as escolas";
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : "Escola não encontrada";
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Gerencie os usuários do sistema. Total: {users.length} | Escolas disponíveis: {schools.length}
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
          onClick={() => handleOpenModal()}
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
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="font-mono">{user.matricula}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role === "master" ? "Admin Master" : user.role === "admin" ? "Administrador" : "Usuário"}</TableCell>
                  <TableCell className="text-sm">{getSchoolName(user.schoolId)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </span>
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
                      onClick={() => handleOpenModal(user)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleSetPassword(user)}
                      title="Definir Senha"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleBlockUser(user.id)}
                      title="Bloquear"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {user.status === "active" ? (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id, "inactive")}
                        className="text-red-600 hover:text-red-700"
                        title="Desativar"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleStatus(user.id, "active")}
                        className="text-green-600 hover:text-green-700"
                        title="Ativar"
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

        {isModalOpen && (
          <ModernUserForm 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveUser}
            initialData={currentUser || undefined}
            schools={schools}
          />
        )}

        {isPasswordModalOpen && selectedUser && (
          <PasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onSave={handleSavePassword}
            user={selectedUser}
          />
        )}

        {isDetailsModalOpen && selectedUser && (
          <UserDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            user={selectedUser}
            schools={schools}
          />
        )}
      </CardContent>
    </Card>
  );
}
