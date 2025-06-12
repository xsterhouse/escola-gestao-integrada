
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryMovements } from "@/components/inventory/InventoryMovements";
import { InventoryReports } from "@/components/inventory/InventoryReports";
import { InventoryHistory } from "@/components/inventory/InventoryHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <AppLayout>
      <div className="space-y-8">
        <InventoryHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">Estoque</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-8">
            <InventoryTable />
          </TabsContent>

          <TabsContent value="movements" className="mt-8">
            <InventoryMovements />
          </TabsContent>

          <TabsContent value="reports" className="mt-8">
            <InventoryReports />
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <InventoryHistory />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
