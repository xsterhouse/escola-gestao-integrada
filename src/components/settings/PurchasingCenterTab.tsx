
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function PurchasingCenterTab() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Central de Compras</CardTitle>
          <CardDescription>
            Gerencie os Polos e grupos de escolas para licitações conjuntas.
          </CardDescription>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Novo Polo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <p className="text-sm mb-2">
            Este módulo está sendo implementado.
          </p>
          <p className="text-sm">
            Aqui o usuário master poderá criar Polos de escolas para participação conjunta em licitações.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
