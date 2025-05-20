
import { AppLayout } from "@/components/layout/AppLayout";
import { ContractsHeader } from "@/components/contracts/ContractsHeader";
import { ImportLicitations } from "@/components/contracts/ImportLicitations";
import { ImportInvoices } from "@/components/contracts/ImportInvoices";
import { ItemVerification } from "@/components/contracts/ItemVerification";
import { ContractReports } from "@/components/contracts/ContractReports";

export default function Contracts() {
  return (
    <AppLayout requireAuth>
      <div className="container mx-auto space-y-8 pb-10">
        <ContractsHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ImportLicitations />
            <ImportInvoices />
          </div>
          <div>
            <ItemVerification />
          </div>
        </div>
        
        <ContractReports />
      </div>
    </AppLayout>
  );
}
