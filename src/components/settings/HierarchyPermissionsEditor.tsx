
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserHierarchy } from "@/lib/types";
import { Shield, Crown, User, Building, ShoppingCart } from "lucide-react";

interface HierarchyPermissionsEditorProps {
  hierarchyLevels: any[];
  onUpdate: (type: string, permissions: any) => void;
}

export function HierarchyPermissionsEditor({ hierarchyLevels, onUpdate }: HierarchyPermissionsEditorProps) {
  const [editingLevel, setEditingLevel] = useState<string | null>(null);

  const getHierarchyIcon = (type: string) => {
    switch (type) {
      case "master": return <Crown className="h-4 w-4 text-yellow-500" />;
      case "diretor_escolar": return <Shield className="h-4 w-4 text-blue-500" />;
      case "secretario": return <User className="h-4 w-4 text-green-500" />;
      case "central_compras": return <ShoppingCart className="h-4 w-4 text-purple-500" />;
      case "funcionario": return <Building className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getDataScopeColor = (scope: string) => {
    switch (scope) {
      case "global": return "bg-red-100 text-red-800";
      case "school": return "bg-blue-100 text-blue-800";
      case "purchasing_center": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuração da Hierarquia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Usuário</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Escopo de Dados</TableHead>
                <TableHead>Criar Usuários</TableHead>
                <TableHead>Gerenciar Escola</TableHead>
                <TableHead>Módulos Permitidos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hierarchyLevels.map((level) => (
                <TableRow key={level.type}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getHierarchyIcon(level.type)}
                      <div>
                        <div className="font-medium">{level.config.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {level.config.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Nível {level.config.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDataScopeColor(level.config.dataScope)}>
                      {level.config.dataScope === "global" ? "Global" :
                       level.config.dataScope === "school" ? "Escola" : "Central"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={level.config.canCreateUsers}
                      disabled={level.type === "master"}
                      onCheckedChange={(checked) => {
                        onUpdate(level.type, { ...level.config, canCreateUsers: checked });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={level.config.canManageSchool}
                      disabled={level.type === "master" || level.type === "central_compras"}
                      onCheckedChange={(checked) => {
                        onUpdate(level.type, { ...level.config, canManageSchool: checked });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {level.config.allowedModules.length} módulos
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLevel(level.type)}
                      disabled={level.type === "master"}
                    >
                      Configurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras de Hierarquia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🔒 Regras de Acesso</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• <strong>Master:</strong> Acesso total ao sistema, pode criar qualquer tipo de usuário</li>
                <li>• <strong>Diretor Escolar:</strong> Gerencia sua escola, cria secretários e funcionários</li>
                <li>• <strong>Secretário:</strong> Operações administrativas, não cria usuários</li>
                <li>• <strong>Central de Compras:</strong> Acesso a múltiplas escolas vinculadas</li>
                <li>• <strong>Funcionário:</strong> Operações básicas limitadas à sua escola</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Isolamento de Dados</h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Cada escola vê apenas seus próprios dados</li>
                <li>• Centrais de compras veem apenas escolas vinculadas</li>
                <li>• Master vê todos os dados do sistema</li>
                <li>• Auditoria registra todos os acessos entre escolas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
