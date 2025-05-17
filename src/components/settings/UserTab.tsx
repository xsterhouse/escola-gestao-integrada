
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/lib/types";
import { UserForm } from "@/components/users/UserForm";
import { useToast } from "@/hooks/use-toast";
import { Eye, Pencil, Trash2, Ban, ShieldCheck, Plus } from "lucide-react";

export function UserTab() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao.silva@escola.edu.br",
      role: "admin",
      schoolId: "1",
      permissions: [
        { id: "1", name: "dashboard", hasAccess: true },
        { id: "2", name: "products", hasAccess: true },
        { id: "3", name: "inventory", hasAccess: true }
      ],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      name: "Maria Oliveira",
      email: "maria@escola.edu.br",
      role: "user",
      schoolId: "1",
      permissions: [
        { id: "1", name: "dashboard", hasAccess: true },
        { id: "2", name: "products", hasAccess: false },
        { id: "3", name: "inventory", hasAccess: true }
      ],
      status: "inactive",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

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
      toast({ 
        title: "Usuário atualizado", 
        description: "As informações do usuário foram atualizadas com sucesso."
      });
    } else {
      // Create new user
      const newUser: User = {
        id: `${users.length + 1}`,
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "user",
        schoolId: userData.schoolId || null,
        permissions: userData.permissions || [],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUsers([...users, newUser]);
      toast({ 
        title: "Usuário adicionado", 
        description: "O usuário foi adicionado com sucesso ao sistema."
      });
    }
    setIsModalOpen(false);
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
    toast({ 
      title: "Visualizar Usuário", 
      description: `Detalhes do usuário ${user.name}`
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Gerencie os usuários do sistema.
          </CardDescription>
        </div>
        <Button 
          className="flex items-center gap-1" 
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
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role === "master" ? "Admin Master" : user.role === "admin" ? "Administrador" : "Usuário"}</TableCell>
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
            ))}
          </TableBody>
        </Table>

        {isModalOpen && (
          <UserForm 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveUser}
            initialData={currentUser || undefined}
          />
        )}
      </CardContent>
    </Card>
  );
}
