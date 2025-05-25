
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { School, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const Users = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load users and schools from localStorage
    const storedUsers = localStorage.getItem('users');
    const storedSchools = localStorage.getItem('schools');
    
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error("Error parsing stored users:", error);
        setUsers([]);
      }
    }
    
    if (storedSchools) {
      try {
        setSchools(JSON.parse(storedSchools));
      } catch (error) {
        console.error("Error parsing stored schools:", error);
        setSchools([]);
      }
    }
  }, []);

  // Save users to localStorage whenever users state changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [users]);

  const handleOpenForm = (user?: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingUser(undefined);
    setIsFormOpen(false);
  };

  const handleSaveUser = (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              ...userData,
              updatedAt: new Date(),
            }
          : user
      );
      setUsers(updatedUsers);
    } else {
      // Create new user
      const newUser: User = {
        id: `${Date.now()}`,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUsers([...users, newUser]);
    }
  };

  const handleDeleteUser = (id: string) => {
    // In a real app, we would show a confirmation dialog
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso.",
      });
    }
  };

  // Get school name by ID
  const getSchoolName = (schoolId: string | null) => {
    if (!schoolId) return "—";
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.name : "Escola não encontrada";
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "master":
        return "Master";
      case "admin":
        return "Administrador";
      case "user":
        return "Usuário";
      case "viewer":
        return "Visualizador";
      default:
        return role;
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRoleLabel(user.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout requiredPermission="settings">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="max-w-sm">
            <Input
              placeholder="Buscar por nome, e-mail, matrícula ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={() => handleOpenForm()}>Adicionar Usuário</Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Escola</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    {searchTerm 
                      ? "Nenhum usuário encontrado com esse termo de busca." 
                      : "Nenhum usuário cadastrado."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-mono">{user.matricula}</TableCell>
                    <TableCell>{user.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "master" ? "default" : "secondary"}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getSchoolName(user.schoolId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenForm(user)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === "master"}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <UserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveUser}
        initialData={editingUser}
        schools={schools}
      />
    </AppLayout>
  );
};

export default Users;
