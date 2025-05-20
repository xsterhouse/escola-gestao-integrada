
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import ContractsHeader from "@/components/contracts/ContractsHeader";
import ImportLicitation from "@/components/contracts/ImportLicitation";
import ImportInvoice from "@/components/contracts/ImportInvoice";
import VerifyItems from "@/components/contracts/VerifyItems";
import ContractsReports from "@/components/contracts/ContractsReports";

export default function Contracts() {
  return (
    <AppLayout requireAuth={true} requiredPermission="view_contracts">
      <div className="space-y-8">
        <ContractsHeader />
        <div className="grid grid-cols-1 gap-8">
          <ImportLicitation />
          <ImportInvoice />
          <VerifyItems />
          <ContractsReports />
        </div>
      </div>
    </AppLayout>
  );
}
