
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Database, Eye, AlertTriangle, Settings } from "lucide-react";

interface DataIsolationConfigProps {
  onUpdate: (config: any) => void;
}

export function DataIsolationConfig({ onUpdate }: DataIsolationConfigProps) {
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [crossTenantLogging, setCrossTenantLogging] = useState(true);

  const isolationRules = [
    {
      dataType: "Planejamentos",
      description: "ATAs e planejamentos escolares",
      schoolIsolated: true,
      centralAccess: false,
      masterAccess: true
    },
    {
      dataType: "Contratos",
      description: "Contratos e licitações",
      schoolIsolated: true,
      centralAccess: true,
      masterAccess: true
    },
    {
      dataType: "Estoque",
      description: "Movimentações de estoque",
      schoolIsolated: true,
      centralAccess: false,
      masterAccess: true
    },
    {
      dataType: "Financeiro",
      description: "Transações financeiras",
      schoolIsolated: true,
      centralAccess: false,
      masterAccess: true
    },
    {
      dataType: "Usuários",
      description: "Dados de usuários do sistema",
      schoolIsolated: false,
      centralAccess: false,
      masterAccess: true
    }
  ];

  const getAuditLogs = () => {
    const logs = JSON.parse(localStorage.getItem("audit_logs") || "[]");
    return logs.slice(-10); // Últimos 10 logs
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuração de Isolamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              O sistema multi-tenant garante que cada escola veja apenas seus próprios dados. 
              Centrais de compras têm acesso limitado às escolas vinculadas.
            </AlertDescription>
          </Alert>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Dados</TableHead>
                <TableHead>Isolado por Escola</TableHead>
                <TableHead>Acesso Central</TableHead>
                <TableHead>Acesso Master</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isolationRules.map((rule, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.dataType}</div>
                      <div className="text-sm text-muted-foreground">
                        {rule.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.schoolIsolated} disabled />
                      {rule.schoolIsolated && (
                        <Badge variant="default">Isolado</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.centralAccess} disabled />
                      {rule.centralAccess && (
                        <Badge variant="secondary">Permitido</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.masterAccess} disabled />
                      <Badge variant="default">Total</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Ativo
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auditoria de Acesso</div>
                <div className="text-sm text-muted-foreground">
                  Registrar todos os acessos aos dados
                </div>
              </div>
              <Switch 
                checked={auditEnabled}
                onCheckedChange={setAuditEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Log Cross-Tenant</div>
                <div className="text-sm text-muted-foreground">
                  Alertar tentativas de acesso entre escolas
                </div>
              </div>
              <Switch 
                checked={crossTenantLogging}
                onCheckedChange={setCrossTenantLogging}
              />
            </div>

            <Button 
              onClick={() => onUpdate({ auditEnabled, crossTenantLogging })}
              className="w-full"
            >
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Logs de Auditoria Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getAuditLogs().length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum log de auditoria registrado
                </p>
              ) : (
                getAuditLogs().map((log: any, index: number) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{log.action}</span>
                      <span className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>Usuário: {log.userType} | Dados: {log.dataType}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Regras de Isolamento Multi-Tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🏫 Escolas</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Dados completamente isolados</li>
                <li>• Cada escola vê apenas seus dados</li>
                <li>• Impossível acessar dados de outras escolas</li>
                <li>• Auditoria em todas as operações</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">🛒 Centrais de Compras</h4>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• Acesso apenas às escolas vinculadas</li>
                <li>• Dados de compras consolidados</li>
                <li>• Relatórios multi-escola permitidos</li>
                <li>• Controle rigoroso de acesso</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">👑 Master</h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Acesso total ao sistema</li>
                <li>• Pode visualizar todas as escolas</li>
                <li>• Configuração global do sistema</li>
                <li>• Auditoria e compliance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
