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
      <div className="container mx-auto py-6 space-y-6">
        <PlanningHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="planning">Planejamento</TabsTrigger>
            <TabsTrigger value="ata-registration">Cadastro ATA</TabsTrigger>
            <TabsTrigger value="ata-validity">Vigência ATA</TabsTrigger>
            <TabsTrigger value="pending-transfers">Transferências</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <PlanningPage />
          </TabsContent>

          <TabsContent value="ata-registration">
            <ATARegistrationTab />
          </TabsContent>

          <TabsContent value="ata-validity">
            <ATAValidityTab />
          </TabsContent>

          <TabsContent value="pending-transfers">
            <PendingTransfersTab />
          </TabsContent>

          <TabsContent value="reports">
            <ATAReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
