
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Edit2, Trash2, Search, CheckCircle } from "lucide-react";
import { formatAccountMask, isValidAccountFormat, validateAccountCode } from "@/utils/accountMask";

interface Account {
  id: string;
  code: string;
  description: string;
  type: 'ativo' | 'passivo' | 'patrimonio' | 'receita' | 'despesa';
  level: number;
  parent?: string;
  isActive: boolean;
  createdAt: Date;
}

export function AccountsTab() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "" as 'ativo' | 'passivo' | 'patrimonio' | 'receita' | 'despesa' | "",
    parent: ""
  });
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  // Validação em tempo real do código contábil
  useEffect(() => {
    if (formData.code) {
      const isValid = isValidAccountFormat(formData.code) && validateAccountCode(formData.code);
      setIsCodeValid(isValid);
    } else {
      setIsCodeValid(false);
    }
  }, [formData.code]);

  const loadAccounts = () => {
    const savedAccounts = JSON.parse(localStorage.getItem('accountingAccounts') || '[]');
    setAccounts(savedAccounts);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccountMask(e.target.value);
    setFormData(prev => ({ ...prev, code: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.description || !formData.type) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!isCodeValid) {
      toast({
        title: "Código inválido",
        description: "O código da conta deve seguir o formato: 0.0.00.00.0000",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o código já existe (exceto para edição)
    const codeExists = accounts.some(acc => 
      acc.code === formData.code && (!editingAccount || acc.id !== editingAccount.id)
    );
    
    if (codeExists) {
      toast({
        title: "Código já existe",
        description: "Este código de conta já está sendo utilizado.",
        variant: "destructive",
      });
      return;
    }

    const newAccount: Account = {
      id: editingAccount?.id || Date.now().toString(),
      code: formData.code,
      description: formData.description,
      type: formData.type as 'ativo' | 'passivo' | 'patrimonio' | 'receita' | 'despesa',
      level: formData.code.split('.').length,
      parent: formData.parent || undefined,
      isActive: true,
      createdAt: editingAccount?.createdAt || new Date()
    };

    let updatedAccounts;
    if (editingAccount) {
      updatedAccounts = accounts.map(acc => acc.id === editingAccount.id ? newAccount : acc);
      toast({
        title: "Conta atualizada",
        description: "A conta foi atualizada com sucesso.",
      });
    } else {
      updatedAccounts = [...accounts, newAccount];
      toast({
        title: "Conta criada",
        description: "A nova conta foi criada com sucesso.",
      });
    }

    setAccounts(updatedAccounts);
    localStorage.setItem('accountingAccounts', JSON.stringify(updatedAccounts));
    
    // Reset form
    setFormData({ code: "", description: "", type: "", parent: "" });
    setEditingAccount(null);
  };

  const handleEdit = (account: Account) => {
    setFormData({
      code: account.code,
      description: account.description,
      type: account.type,
      parent: account.parent || ""
    });
    setEditingAccount(account);
  };

  const handleDelete = (accountId: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('accountingAccounts', JSON.stringify(updatedAccounts));
    
    toast({
      title: "Conta excluída",
      description: "A conta foi excluída com sucesso.",
    });
  };

  const filteredAccounts = accounts.filter(account =>
    account.code.includes(searchTerm) ||
    account.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAccountTypeLabel = (type: string) => {
    const types = {
      ativo: 'Ativo',
      passivo: 'Passivo', 
      patrimonio: 'Patrimônio Líquido',
      receita: 'Receita',
      despesa: 'Despesa'
    };
    return types[type as keyof typeof types] || type;
  };

  const getAccountTypeBadgeColor = (type: string) => {
    const colors = {
      ativo: 'bg-blue-100 text-blue-800',
      passivo: 'bg-red-100 text-red-800',
      patrimonio: 'bg-purple-100 text-purple-800',
      receita: 'bg-green-100 text-green-800',
      despesa: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Conta */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl text-gray-800">
            {editingAccount ? 'Editar Conta Contábil' : 'Nova Conta Contábil'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Código da Conta *
                  {isCodeValid && <CheckCircle className="h-4 w-4 text-green-600" />}
                </Label>
                <Input
                  id="code"
                  placeholder="0.0.00.00.0000"
                  value={formData.code}
                  onChange={handleCodeChange}
                  className={`h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    formData.code && !isCodeValid ? 'border-red-500' : ''
                  } ${isCodeValid ? 'border-green-500' : ''}`}
                  maxLength={12}
                />
                {formData.code && !isCodeValid && (
                  <p className="text-xs text-red-600">
                    Formato inválido. Use: 0.0.00.00.0000 (1-9.1-9.01-99.01-99.0001-9999)
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Formato: 0.0.00.00.0000 (ex: 1.1.01.01.0001)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descrição da Conta *
                </Label>
                <Input
                  id="description"
                  placeholder="Digite a descrição da conta"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Tipo da Conta *
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="passivo">Passivo</SelectItem>
                    <SelectItem value="patrimonio">Patrimônio Líquido</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent" className="text-sm font-medium text-gray-700">
                  Conta Pai (Opcional)
                </Label>
                <Select value={formData.parent} onValueChange={(value) => setFormData(prev => ({ ...prev, parent: value }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione a conta pai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma (Conta Principal)</SelectItem>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.code}>
                        {account.code} - {account.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!isCodeValid || !formData.description || !formData.type}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingAccount ? 'Atualizar Conta' : 'Criar Conta'}
              </Button>
              {editingAccount && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setFormData({ code: "", description: "", type: "", parent: "" });
                    setEditingAccount(null);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-800">Plano de Contas</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar contas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAccounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono font-medium">{account.code}</TableCell>
                    <TableCell>{account.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getAccountTypeBadgeColor(account.type)}>
                        {getAccountTypeLabel(account.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.level}</TableCell>
                    <TableCell>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(account.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhuma conta encontrada.' : 'Nenhuma conta cadastrada ainda.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
