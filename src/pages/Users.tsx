
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

// Mock data
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin Master",
    email: "admin@sigre.com",
    role: "master",
    schoolId: null,
    permissions: [
      { id: "1", name: "dashboard", hasAccess: true },
      { id: "2", name: "products", hasAccess: true },
      { id: "3", name: "inventory", hasAccess: true },
      { id: "4", name: "financial", hasAccess: true },
      { id: "5", name: "planning", hasAccess: true },
      { id: "6", name: "contracts", hasAccess: true },
      { id: "7", name: "accounting", hasAccess: true },
      { id: "8", name: "settings", hasAccess: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Maria Silva",
    email: "maria@joaodasilva.edu.br",
    role: "admin",
    schoolId: "1",
    permissions: [
      { id: "1", name: "dashboard", hasAccess: true },
      { id: "2", name: "products", hasAccess: true },
      { id: "3", name: "inventory", hasAccess: true },
      { id: "4", name: "financial", hasAccess: true },
      { id: "5", name: "planning", hasAccess: false },
      { id: "6", name: "contracts", hasAccess: false },
      { id: "7", name: "accounting", hasAccess: false },
      { id: "8", name: "settings", hasAccess: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "João Pereira",
    email: "joao@paulofreire.edu.br",
    role: "user",
    schoolId: "2",
    permissions: [
      { id: "1", name: "dashboard", hasAccess: true },
      { id: "2", name: "products", hasAccess: false },
      { id: "3", name: "inventory", hasAccess: true },
      { id: "4", name: "financial", hasAccess: false },
      { id: "5", name: "planning", hasAccess: false },
      { id: "6", name: "contracts", hasAccess: false },
      { id: "7", name: "accounting", hasAccess: false },
      { id: "8", name: "settings", hasAccess: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock schools
const MOCK_SCHOOLS: School[] = [
  {
    id: "1",
    name: "Escola Municipal João da Silva",
    cnpj: "12.345.678/0001-90",
    responsibleName: "Maria Oliveira",
    email: "contato@joaodasilva.edu.br",
    status: "active", // Adding the required status property
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Colégio Estadual Paulo Freire",
    cnpj: "98.765.432/0001-10",
    responsibleName: "Carlos Santos",
    email: "contato@paulofreire.edu.br",
    status: "active", // Adding the required status property
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const Users = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, these would be API calls
    setUsers(MOCK_USERS);
    setSchools(MOCK_SCHOOLS);
  }, []);

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
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...userData,
                updatedAt: new Date(),
              }
            : user
        )
      );
    } else {
      // Create new user
      const newUser: User = {
        id: `${users.length + 1}`,
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
      setUsers(users.filter((user) => user.id !== id));
      
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
              placeholder="Buscar por nome, e-mail ou tipo..."
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
                <TableHead>E-mail</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Escola</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    {searchTerm 
                      ? "Nenhum usuário encontrado com esse termo de busca." 
                      : "Nenhum usuário cadastrado."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
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
