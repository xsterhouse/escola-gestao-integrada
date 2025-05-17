
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function UserTab() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Gerencie os usuários e suas permissões de acesso.
          </CardDescription>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <p className="text-sm mb-2">
            Este módulo está sendo implementado.
          </p>
          <p className="text-sm">
            Aqui o usuário master poderá criar outros usuários e definir suas permissões.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
