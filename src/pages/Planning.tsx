import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Plus, Delete, Save, RotateCcw, Download, FileText, BarChart3, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Planning = () => {
  const { currentSchool } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("nova-ata");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNewATAModalOpen, setIsNewATAModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [ataItems, setAtaItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    numeroItem: "",
    descricaoProduto: "",
    unidade: "",
    quantidade: "",
    valorUnitario: "",
    valorTotal: ""
  });

  // Get schools and purchasing centers from localStorage (connected to settings)
  const getSchoolsFromSettings = () => {
    try {
      const schools = JSON.parse(localStorage.getItem("schools") || "[]");
      return schools;
    } catch {
      return [];
    }
  };

  const getPurchasingCentersFromSettings = () => {
    try {
      const centers = JSON.parse(localStorage.getItem("purchasingCenters") || "[]");
      return centers;
    } catch {
      return [];
    }
  };

  const tabs = [
    { id: "nova-ata", label: "Nova ATA" },
    { id: "vigencia", label: "Vigência" },
    { id: "relatorios", label: "Relatórios" },
    { id: "transferencia", label: "Transferência de Saldos" }
  ];

  const handleViewDetails = (process: any) => {
    setSelectedProcess(process);
    setIsDetailsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!newItem.numeroItem || !newItem.descricaoProduto || !newItem.quantidade || !newItem.valorUnitario) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const valorTotal = parseFloat(newItem.quantidade) * parseFloat(newItem.valorUnitario);
    const item = {
      ...newItem,
      valorTotal: valorTotal.toFixed(2),
      id: Date.now()
    };

    setAtaItems([...ataItems, item]);
    setNewItem({
      numeroItem: "",
      descricaoProduto: "",
      unidade: "",
      quantidade: "",
      valorUnitario: "",
      valorTotal: ""
    });

    toast({
      title: "Item adicionado",
      description: "Item foi adicionado à ATA com sucesso"
    });
  };

  const handleSaveATA = () => {
    if (ataItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à ATA",
        variant: "destructive"
      });
      return;
    }

    // Save ATA to localStorage
    const atas = JSON.parse(localStorage.getItem("atas") || "[]");
    const newATA = {
      id: Date.now(),
      schoolId: currentSchool?.id,
      items: ataItems,
      createdAt: new Date(),
      status: "ativa"
    };
    
    localStorage.setItem("atas", JSON.stringify([...atas, newATA]));
    setAtaItems([]);
    setIsNewATAModalOpen(false);

    toast({
      title: "ATA salva",
      description: "ATA foi salva com sucesso"
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "nova-ata":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold mb-4">Registrar Nova ATA</h2>
              <Dialog open={isNewATAModalOpen} onOpenChange={setIsNewATAModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Incluir Nova ATA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Nova ATA de Registro de Preços</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Escola</label>
                        <select className="w-full border rounded-md px-3 py-2">
                          <option>Selecione a escola</option>
                          {getSchoolsFromSettings().map((school: any) => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Central de Compras</label>
                        <select className="w-full border rounded-md px-3 py-2">
                          <option>Selecione a central</option>
                          {getPurchasingCentersFromSettings().map((center: any) => (
                            <option key={center.id} value={center.id}>{center.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">Adicionar Item</h3>
                      <div className="grid grid-cols-6 gap-2 mb-4">
                        <Input
                          placeholder="Nº Item"
                          value={newItem.numeroItem}
                          onChange={(e) => setNewItem({...newItem, numeroItem: e.target.value})}
                        />
                        <Input
                          placeholder="Descrição do Produto"
                          value={newItem.descricaoProduto}
                          onChange={(e) => setNewItem({...newItem, descricaoProduto: e.target.value})}
                        />
                        <select 
                          className="border rounded-md px-3 py-2"
                          value={newItem.unidade}
                          onChange={(e) => setNewItem({...newItem, unidade: e.target.value})}
                        >
                          <option value="">Unid</option>
                          <option value="Kg">Kg</option>
                          <option value="Litro">Litro</option>
                          <option value="Unidade">Unidade</option>
                          <option value="Pacote">Pacote</option>
                        </select>
                        <Input
                          type="number"
                          placeholder="Quant"
                          value={newItem.quantidade}
                          onChange={(e) => setNewItem({...newItem, quantidade: e.target.value})}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Vl Unit"
                          value={newItem.valorUnitario}
                          onChange={(e) => setNewItem({...newItem, valorUnitario: e.target.value})}
                        />
                        <Button onClick={handleAddItem} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {ataItems.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Itens Adicionados:</h4>
                          {ataItems.map((item) => (
                            <div key={item.id} className="p-3 bg-gray-50 rounded-md flex justify-between">
                              <div>
                                <p className="font-medium">{item.numeroItem} - {item.descricaoProduto}</p>
                                <p className="text-sm text-gray-600">
                                  {item.quantidade} {item.unidade} x R$ {item.valorUnitario} = R$ {item.valorTotal}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAtaItems(ataItems.filter(i => i.id !== item.id))}
                              >
                                <Delete className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <div className="flex justify-between items-center pt-4 border-t">
                            <div>
                              <p className="font-bold">
                                Total: R$ {ataItems.reduce((sum, item) => sum + parseFloat(item.valorTotal), 0).toFixed(2)}
                              </p>
                            </div>
                            <Button onClick={handleSaveATA} className="bg-green-600 hover:bg-green-700">
                              <Save className="h-4 w-4 mr-2" />
                              Salvar ATA
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">
                  Clique no botão "Incluir Nova ATA" para registrar uma nova ATA de Registro de Preços.
                </p>
              </CardContent>
            </Card>
          </div>
        );

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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewDetails({
                        processo: "2025.0037",
                        fornecedor: "NutriAlimentos LTDA",
                        vigenciaInicio: "01/02/2025",
                        vigenciaFim: "31/12/2025",
                        itens: 8,
                        status: "Ativa",
                        valorTotal: "R$ 125.000,00"
                      })}
                    >
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewDetails({
                        processo: "2025.0042",
                        fornecedor: "Cereais Brasil S.A.",
                        vigenciaInicio: "15/01/2025",
                        vigenciaFim: "15/01/2026",
                        itens: 12,
                        status: "Ativa",
                        valorTotal: "R$ 180.000,00"
                      })}
                    >
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewDetails({
                        processo: "2025.0039",
                        fornecedor: "Frutas & Cia Distribuidora",
                        vigenciaInicio: "10/01/2025",
                        vigenciaFim: "10/02/2025",
                        itens: 15,
                        status: "Expirando",
                        valorTotal: "R$ 95.000,00"
                      })}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Detalhes do Processo</DialogTitle>
                </DialogHeader>
                {selectedProcess && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium">Processo:</label>
                        <p>{selectedProcess.processo}</p>
                      </div>
                      <div>
                        <label className="font-medium">Fornecedor:</label>
                        <p>{selectedProcess.fornecedor}</p>
                      </div>
                      <div>
                        <label className="font-medium">Vigência:</label>
                        <p>{selectedProcess.vigenciaInicio} - {selectedProcess.vigenciaFim}</p>
                      </div>
                      <div>
                        <label className="font-medium">Status:</label>
                        <p>{selectedProcess.status}</p>
                      </div>
                      <div>
                        <label className="font-medium">Quantidade de Itens:</label>
                        <p>{selectedProcess.itens}</p>
                      </div>
                      <div>
                        <label className="font-medium">Valor Total:</label>
                        <p>{selectedProcess.valorTotal}</p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
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
                  <select className="w-full border border-input rounded-md px-3 py-2">
                    <option>Selecione a escola de origem</option>
                    {getSchoolsFromSettings().map((school: any) => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escola de Destino</label>
                  <select className="w-full border border-input rounded-md px-3 py-2">
                    <option>Selecione a escola de destino</option>
                    {getSchoolsFromSettings().map((school: any) => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Central de Compras</label>
                  <select className="w-full border border-input rounded-md px-3 py-2">
                    <option>Selecione a central</option>
                    {getPurchasingCentersFromSettings().map((center: any) => (
                      <option key={center.id} value={center.id}>{center.name}</option>
                    ))}
                  </select>
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
              </div>
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
