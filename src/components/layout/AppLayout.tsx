
import { TenantHeader } from "./TenantHeader";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar fixa */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>
      
      {/* Container principal com margem para a sidebar */}
      <div className="flex-1 flex flex-col ml-80 md:ml-20">
        <TenantHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
