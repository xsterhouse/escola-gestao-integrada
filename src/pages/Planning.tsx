
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PlanningHeader } from "@/components/planning/PlanningHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanningPage } from "@/components/planning/PlanningPage";
import { ATARegistrationTab } from "@/components/planning/ATARegistrationTab";
import { ATAValidityTab } from "@/components/planning/ATAValidityTab";
import { PendingTransfersTab } from "@/components/planning/PendingTransfersTab";
import { ATAReportsTab } from "@/components/planning/ATAReportsTab";

export default function Planning() {
  const [activeTab, setActiveTab] = useState("planning");

  return (
    <AppLayout>
      <div className="space-y-8">
        <PlanningHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="planning">Planejamento</TabsTrigger>
            <TabsTrigger value="ata-registration">Cadastro ATA</TabsTrigger>
            <TabsTrigger value="ata-validity">Vigência ATA</TabsTrigger>
            <TabsTrigger value="pending-transfers">Transferências</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="mt-8">
            <PlanningPage />
          </TabsContent>

          <TabsContent value="ata-registration" className="mt-8">
            <ATARegistrationTab />
          </TabsContent>

          <TabsContent value="ata-validity" className="mt-8">
            <ATAValidityTab />
          </TabsContent>

          <TabsContent value="pending-transfers" className="mt-8">
            <PendingTransfersTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-8">
            <ATAReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
