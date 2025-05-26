
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface Account {
  id: string;
  code: string;
  description: string;
  type: string;
  resourceType: string;
  createdAt: string;
}

export function AccountConfigTab() {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const stored = localStorage.getItem('accountingAccounts');
    return stored ? JSON.parse(stored) : [];
  });
  
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "",
    resourceType: ""
  });
  
  const { toast } = useToast();

  const accountTypes = [
    { value: "ativo", label: "Ativo" },
    { value: "passivo", label: "Passivo" },
    { value: "receita", label: "Receita" },
    { value: "despesa", label: "Despesa" },
    { value: "patrimonial", label: "Patrimonial" }
  ];

  const resourceTypes = [
    { value: "fundeb", label: "FUNDEB" },
    { value: "pnate", label: "PNATE" },
    { value: "pnae", label: "PNAE" },
    { value: "proprios", label: "Recursos Próprios" },
    { value: "outros", label: "Outros" }
  ];

  const handleAddAccount = () => {
    if (!formData.code || !formData.description || !formData.type || !formData.resourceType) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar a conta.",
        variant: "destructive",
      });
      return;
    }

    const newAccount: Account = {
      id: Date.now().toString(),
      code: formData.code,
      description: formData.description,
      type: formData.type,
      resourceType: formData.resourceType,
      createdAt: new Date().toISOString()
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem('accountingAccounts', JSON.stringify(updatedAccounts));

    setFormData({
      code: "",
      description: "",
      type: "",
      resourceType: ""
    });

    toast({
      title: "Conta adicionada",
      description: "A conta contábil foi configurada com sucesso.",
    });
  };

  const handleDeleteAccount = (id: string) => {
    const updatedAccounts = accounts.filter(account => account.id !== id);
    setAccounts(updatedAccounts);
    localStorage.setItem('accountingAccounts', JSON.stringify(updatedAccounts));

    toast({
      title: "Conta removida",
      description: "A conta contábil foi removida com sucesso.",
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      ativo: "bg-blue-100 text-blue-800",
      passivo: "bg-red-100 text-red-800",
      receita: "bg-green-100 text-green-800",
      despesa: "bg-orange-100 text-orange-800",
      patrimonial: "bg-purple-100 text-purple-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Configuração */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800">Configuração de Contas Contábeis</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Código da Conta</Label>
              <Input
                placeholder="Ex: 1.1.1.01"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Descrição</Label>
              <Input
                placeholder="Ex: Caixa"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tipo da Conta</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tipo de Recurso</Label>
              <Select value={formData.resourceType} onValueChange={(value) => setFormData(prev => ({ ...prev, resourceType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o recurso" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map(resource => (
                    <SelectItem key={resource.value} value={resource.value}>
                      {resource.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleAddAccount}
              className="h-10 px-6 text-white font-semibold"
              style={{ backgroundColor: '#041c43' }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Contas Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhuma conta configurada. Adicione contas para começar.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono">{account.code}</TableCell>
                    <TableCell>{account.description}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(account.type)}>
                        {accountTypes.find(t => t.value === account.type)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resourceTypes.find(r => r.value === account.resourceType)?.label}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
