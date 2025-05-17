
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PermissionsTab() {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Permissões do Sistema</CardTitle>
        <CardDescription>
          Configure as permissões de acesso aos módulos do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <p className="text-sm mb-2">
            Este módulo está sendo implementado.
          </p>
          <p className="text-sm">
            Aqui o usuário master poderá definir quais permissões são necessárias para cada módulo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
