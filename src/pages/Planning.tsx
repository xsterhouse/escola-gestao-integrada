
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Plus, Delete, Save, RotateCcw, Download, FileText, BarChart3, ArrowLeftRight } from "lucide-react";

const Planning = () => {
  const [activeTab, setActiveTab] = useState("vigencia");

  const tabs = [
    { id: "vigencia", label: "Vigência" },
    { id: "relatorios", label: "Relatórios" },
    { id: "transferencia", label: "Transferência de Saldos" },
    { id: "nova-ata", label: "Nova ATA" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "vigencia":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">ATAs em Vigência</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Processo: 2025.0037</h3>
                      <p className="text-gray-600">Fornecedor: NutriAlimentos LTDA</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Ativa</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-1">
                    <p className="text-sm"><span className="text-gray-600">Vigência:</span> 01/02/2025 - 31/12/2025</p>
                    <p className="text-sm"><span className="text-gray-600">Itens:</span> 8 produtos</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Processo: 2025.0042</h3>
                      <p className="text-gray-600">Fornecedor: Cereais Brasil S.A.</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Ativa</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-1">
                    <p className="text-sm"><span className="text-gray-600">Vigência:</span> 15/01/2025 - 15/01/2026</p>
                    <p className="text-sm"><span className="text-gray-600">Itens:</span> 12 produtos</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">Processo: 2025.0039</h3>
                      <p className="text-gray-600">Fornecedor: Frutas & Cia Distribuidora</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Expirando</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-1">
                    <p className="text-sm"><span className="text-gray-600">Vigência:</span> 10/01/2025 - 10/02/2025</p>
                    <p className="text-sm"><span className="text-gray-600">Itens:</span> 15 produtos</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "relatorios":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Relatórios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-blue-100 text-blue-600 rounded-full mb-3 mx-auto">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-center">Relatório por Escola</h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">Exporte relatórios detalhados por escola, com todos os produtos contratados e saldos disponíveis.</p>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-blue-100 text-blue-600 rounded-full mb-3 mx-auto">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-center">Relatório por Produto</h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">Visualize a distribuição de um produto específico entre as escolas da rede municipal.</p>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-blue-100 text-blue-600 rounded-full mb-3 mx-auto">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-center">Relatório por Fornecedor</h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">Acompanhe os contratos e entregas por fornecedor em todas as escolas do município.</p>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Exportar relatório personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                    <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Todas as escolas</option>
                      <option>Escola Municipal Aurora</option>
                      <option>Escola Municipal Primavera</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                    <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Todos os fornecedores</option>
                      <option>NutriAlimentos LTDA</option>
                      <option>Cereais Brasil S.A.</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Ano letivo atual</option>
                      <option>Último trimestre</option>
                      <option>Último mês</option>
                      <option>Personalizado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "transferencia":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Transferência de Saldos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escola de Origem</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Selecione a escola de origem</option>
                    <option>Escola Municipal Aurora</option>
                    <option>Escola Municipal Primavera</option>
                    <option>Escola Municipal Arco-Íris</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escola de Destino</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Selecione a escola de destino</option>
                    <option>Escola Municipal Aurora</option>
                    <option>Escola Municipal Primavera</option>
                    <option>Escola Municipal Arco-Íris</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Selecione o fornecedor</option>
                    <option>NutriAlimentos LTDA</option>
                    <option>Cereais Brasil S.A.</option>
                    <option>Frutas & Cia Distribuidora</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Selecione o produto</option>
                    <option>Leite em pó, 400g</option>
                    <option>Arroz branco, tipo 1</option>
                    <option>Feijão carioca</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade a Transferir</label>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      placeholder="Quantidade" 
                      className="flex-1"
                    />
                    <span className="ml-2 text-gray-600 text-sm">de 350 disponíveis</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
                  <Textarea 
                    className="h-36"
                    placeholder="Explique o motivo da transferência"
                  />
                </div>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Informações sobre a transferência
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• As transferências só são permitidas entre escolas da mesma Central de Compras.</li>
                      <li>• O saldo será automaticamente atualizado nas duas escolas após a confirmação.</li>
                      <li>• Todas as transferências ficam registradas para fins de auditoria.</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">
                    Cancelar
                  </Button>
                  <Button>
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    Realizar Transferência
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "nova-ata":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Registrar Nova ATA</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                  <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Selecione a escola</option>
                    <option>Escola Municipal Aurora</option>
                    <option>Escola Municipal Primavera</option>
                    <option>Escola Municipal Arco-Íris</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                  <Input placeholder="Nome do fornecedor" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número do Processo</label>
                  <Input placeholder="Ex: 2025.0037" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da ATA</label>
                    <Input type="date" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Central de Compras</label>
                    <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Selecione a central</option>
                      <option>Central Norte</option>
                      <option>Central Sul</option>
                      <option>Central Leste</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vigência - Início</label>
                    <Input type="date" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vigência - Fim</label>
                    <Input type="date" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produtos</label>
                  <Card className="p-4">
                    <div className="mb-4 grid grid-cols-5 gap-2">
                      <div className="col-span-2">
                        <Input placeholder="Nome do produto" />
                      </div>
                      <div>
                        <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                          <option>Unidade</option>
                          <option>Kg</option>
                          <option>Litro</option>
                          <option>Pacote</option>
                        </select>
                      </div>
                      <div>
                        <Input type="number" placeholder="Qtd." />
                      </div>
                      <div>
                        <Input placeholder="R$ Unitário" />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">Leite em pó, 400g</p>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>Unidade</span>
                              <span>Qtd: 500</span>
                              <span>R$ 7,50/un</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">R$ 3.750,00</p>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Delete className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">Arroz branco, tipo 1</p>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>Kg</span>
                              <span>Qtd: 200</span>
                              <span>R$ 5,30/kg</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">R$ 1.060,00</p>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Delete className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full border-dashed">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar outro produto
                    </Button>
                  </Card>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <Textarea 
                    className="h-24"
                    placeholder="Observações adicionais sobre a ATA"
                  />
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div className="text-gray-700">
                    <p className="font-semibold">Total da ATA:</p>
                    <p className="text-xl font-bold text-blue-700">R$ 4.810,00</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline">
                      Cancelar
                    </Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar ATA
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout requireAuth requiredPermission="planning">
      <div className="w-full max-w-[1200px] mx-auto p-6 bg-gray-50 min-h-screen font-sans">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Sistema de Gestão de Atas de Registro de Preços</h1>
          <p className="text-gray-600 mt-2">Gerencie e controle as ATAs relacionadas a produtos alimentícios para escolas</p>
        </header>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex space-x-2 border-b pb-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={activeTab === tab.id 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="mt-4">
              {renderTabContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Planning;
