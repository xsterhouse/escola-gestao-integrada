
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit2, Trash2 } from "lucide-react";
import { getAccountTypeLabel, getAccountTypeBadgeColor } from "./AccountValidation";

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

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

export function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAccounts = accounts.filter(account =>
    account.code.includes(searchTerm) ||
    account.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
                        onClick={() => onEdit(account)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(account.id)}
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
  );
}
