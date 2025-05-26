
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryMovements } from "@/components/inventory/InventoryMovements";
import { InventoryReports } from "@/components/inventory/InventoryReports";
import { AddInvoiceDialog } from "@/components/inventory/AddInvoiceDialog";
import { ImportXmlDialog } from "@/components/inventory/ImportXmlDialog";
import { Invoice } from "@/lib/types";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";

export default function Inventory() {
  const { data: invoices, saveData: setInvoices } = useLocalStorageSync<Invoice>('invoices', []);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isImportXmlOpen, setIsImportXmlOpen] = useState(false);
  
  const handleAddInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    setIsAddInvoiceOpen(false);
  };

  const handleXmlImport = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    setIsImportXmlOpen(false);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    );
    setInvoices(updatedInvoices);
  };

  return (
    <AppLayout requireAuth={true} requiredPermission="inventory">
      <div className="space-y-6">
        <InventoryHeader 
          onAddInvoice={() => setIsAddInvoiceOpen(true)}
          onImportXml={() => setIsImportXmlOpen(true)}
        />

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="inventory">Estoque</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-4">
            <InventoryTable 
              invoices={invoices} 
              onUpdateInvoice={handleUpdateInvoice}
            />
          </TabsContent>

          <TabsContent value="movements" className="mt-4">
            <InventoryMovements invoices={invoices} />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <InventoryReports invoices={invoices} />
          </TabsContent>
        </Tabs>
      </div>

      <AddInvoiceDialog 
        open={isAddInvoiceOpen} 
        onOpenChange={setIsAddInvoiceOpen}
        onSubmit={handleAddInvoice}
      />

      <ImportXmlDialog
        open={isImportXmlOpen}
        onOpenChange={setIsImportXmlOpen}
        onSubmit={handleXmlImport}
        existingInvoices={invoices}
      />
    </AppLayout>
  );
}
