
import { TenantHeader } from "./TenantHeader";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar completamente fixa */}
      <div className="fixed inset-y-0 left-0 z-50 bg-[#012340]">
        <Sidebar />
      </div>
      
      {/* Container principal com margem para a sidebar e scroll independente */}
      <div className="flex-1 flex flex-col ml-80 md:ml-20 min-h-screen">
        <TenantHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
