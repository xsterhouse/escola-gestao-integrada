import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Plus, Trash2, Save, Download, FileText, BarChart3, ArrowLeftRight, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ATAItem {
  id: string;
  numeroItem: string;
  descricaoProduto: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface ATA {
  id: string;
  numeroATA: string; // Agora será o ID automático (ATA001, ATA002, etc.)
  dataATA: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  status: "rascunho" | "finalizada" | "aprovada";
  items: ATAItem[];
  createdAt: string;
  schoolId?: string;
  centralComprasId?: string;
  valorTotal: number;
}

const Planning = () => {
  const { currentSchool } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("nova-ata");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNewATAModalOpen, setIsNewATAModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ATA | null>(null);
  const [atas, setAtas] = useState<ATA[]>([]);
  const [ataItems, setAtaItems] = useState<ATAItem[]>([]);
  const [formData, setFormData] = useState({
    dataATA: "",
    dataInicioVigencia: "",
    dataFimVigencia: "",
    schoolId: "",
    centralComprasId: ""
  });
  const [newItem, setNewItem] = useState({
    numeroItem: "",
    descricaoProduto: "",
    unidade: "",
    quantidade: "",
    valorUnitario: ""
  });

  // Load data from localStorage
  useEffect(() => {
    loadATAs();
  }, []);

  const loadATAs = () => {
    try {
      const storedATAs = localStorage.getItem("atas");
      if (storedATAs) {
        setAtas(JSON.parse(storedATAs));
      }
    } catch (error) {
      console.error("Error loading ATAs:", error);
    }
  };

  const saveATAs = (atasToSave: ATA[]) => {
    try {
      localStorage.setItem("atas", JSON.stringify(atasToSave));
      setAtas(atasToSave);
    } catch (error) {
      console.error("Error saving ATAs:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados",
        variant: "destructive"
      });
    }
  };

  // Generate automatic ATA ID
  const generateATAId = () => {
    const existingNumbers = atas.map(ata => {
      const match = ata.numeroATA.match(/ATA(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const nextNumber = Math.max(0, ...existingNumbers) + 1;
    return `ATA${nextNumber.toString().padStart(3, '0')}`;
  };

  // Get schools and purchasing centers from localStorage
  const getSchoolsFromSettings = () => {
    try {
      const schools = JSON.parse(localStorage.getItem("schools") || "[]");
      console.log("Escolas carregadas:", schools);
      return schools;
    } catch {
      return [];
    }
  };

  const getPurchasingCentersFromSettings = () => {
    try {
      const storageData = localStorage.getItem("purchasing-centers");
      console.log("Dados brutos das centrais:", storageData);
      
      if (!storageData) return [];
      
      const parsedData = JSON.parse(storageData);
      console.log("Dados parseados das centrais:", parsedData);
      
      // Se for um array de objetos com propriedade 'data', extrair os dados
      if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].data) {
        const centers = parsedData.map(item => item.data);
        console.log("Centrais extraídas (com .data):", centers);
        return centers;
      }
      
      // Se for um array direto, retornar como está
      if (Array.isArray(parsedData)) {
        console.log("Centrais diretas:", parsedData);
        return parsedData;
      }
      
      return [];
    } catch (error) {
      console.error("Error loading purchasing centers:", error);
      return [];
    }
  };

  // Get purchasing centers filtered by selected school
  const getAvailablePurchasingCenters = () => {
    const allCenters = getPurchasingCentersFromSettings();
    console.log("Todas as centrais disponíveis:", allCenters);
    console.log("Escola selecionada:", formData.schoolId);
    
    if (!formData.schoolId) {
      console.log("Nenhuma escola selecionada, retornando array vazio");
      return [];
    }
    
    // Filtrar centrais que estão vinculadas à escola selecionada
    const filteredCenters = allCenters.filter(center => {
      console.log(`Verificando central ${center.name}:`, {
        centerSchoolIds: center.schoolIds,
        selectedSchoolId: formData.schoolId,
        hasSchoolIds: center.schoolIds && Array.isArray(center.schoolIds),
        includes: center.schoolIds && center.schoolIds.includes(formData.schoolId)
      });
      
      return center.schoolIds && 
             Array.isArray(center.schoolIds) && 
             center.schoolIds.includes(formData.schoolId);
    });
    
    console.log("Centrais filtradas para a escola:", filteredCenters);
    return filteredCenters;
  };

  const tabs = [
    { id: "nova-ata", label: "Nova ATA" },
    { id: "gestao-atas", label: "Gestão de ATAs" },
    { id: "vigencia", label: "Vigência" },
    { id: "relatorios", label: "Relatórios" },
    { id: "transferencia", label: "Transferência de Saldos" }
  ];

  const handleViewDetails = (ata: ATA) => {
    setSelectedProcess(ata);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteATA = (ataId: string) => {
    const updatedATAs = atas.filter(ata => ata.id !== ataId);
    saveATAs(updatedATAs);
    toast({
      title: "ATA excluída",
      description: "ATA foi excluída com sucesso"
    });
  };

  const handleFinalizeATA = (ataId: string) => {
    const updatedATAs = atas.map(ata => 
      ata.id === ataId ? { ...ata, status: "finalizada" as const } : ata
    );
    saveATAs(updatedATAs);
    toast({
      title: "ATA finalizada",
      description: "ATA foi finalizada com sucesso"
    });
  };

  const handleApproveATA = (ataId: string) => {
    const updatedATAs = atas.map(ata => 
      ata.id === ataId ? { ...ata, status: "aprovada" as const } : ata
    );
    saveATAs(updatedATAs);
    toast({
      title: "ATA aprovada",
      description: "ATA foi aprovada e está disponível para transferências"
    });
  };

  const handleSchoolChange = (schoolId: string) => {
    console.log("Escola selecionada:", schoolId);
    setFormData(prev => ({
      ...prev,
      schoolId,
      centralComprasId: "" // Reset central de compras quando escola mudar
    }));
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
    const item: ATAItem = {
      id: Date.now().toString(),
      numeroItem: newItem.numeroItem,
      descricaoProduto: newItem.descricaoProduto,
      unidade: newItem.unidade,
      quantidade: parseFloat(newItem.quantidade),
      valorUnitario: parseFloat(newItem.valorUnitario),
      valorTotal: valorTotal
    };

    setAtaItems([...ataItems, item]);
    setNewItem({
      numeroItem: "",
      descricaoProduto: "",
      unidade: "",
      quantidade: "",
      valorUnitario: ""
    });

    toast({
      title: "Item adicionado",
      description: "Item foi adicionado à ATA com sucesso"
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setAtaItems(ataItems.filter(item => item.id !== itemId));
  };

  const handleSaveATA = () => {
    if (!formData.dataATA || !formData.dataInicioVigencia || !formData.dataFimVigencia || ataItems.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos um item",
        variant: "destructive"
      });
      return;
    }

    if (!formData.schoolId) {
      toast({
        title: "Erro",
        description: "Selecione uma escola",
        variant: "destructive"
      });
      return;
    }

    if (!formData.centralComprasId) {
      toast({
        title: "Erro",
        description: "Selecione uma central de compras",
        variant: "destructive"
      });
      return;
    }

    const valorTotal = ataItems.reduce((sum, item) => sum + item.valorTotal, 0);
    const newATA: ATA = {
      id: Date.now().toString(),
      numeroATA: generateATAId(),
      ...formData,
      items: ataItems,
      createdAt: new Date().toISOString(),
      status: "rascunho",
      valorTotal: valorTotal
    };

    const updatedATAs = [...atas, newATA];
    saveATAs(updatedATAs);
    
    // Reset form
    setFormData({
      dataATA: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
      schoolId: "",
      centralComprasId: ""
    });
    setAtaItems([]);
    setIsNewATAModalOpen(false);

    toast({
      title: "ATA salva",
      description: `ATA ${newATA.numeroATA} foi salva com sucesso`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "rascunho":
        return <Badge variant="secondary">Rascunho</Badge>;
      case "finalizada":
        return <Badge variant="outline">Finalizada</Badge>;
      case "aprovada":
        return <Badge variant="default" className="bg-green-600">Aprovada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
                  <Button style={{ backgroundColor: "#012340" }} className="hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Incluir Nova ATA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova ATA de Registro de Preços</DialogTitle>
                    <p className="text-sm text-gray-600">ID será gerado automaticamente: {generateATAId()}</p>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Data da ATA</label>
                        <Input
                          type="date"
                          value={formData.dataATA}
                          onChange={(e) => setFormData({...formData, dataATA: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Início da Vigência</label>
                        <Input
                          type="date"
                          value={formData.dataInicioVigencia}
                          onChange={(e) => setFormData({...formData, dataInicioVigencia: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Fim da Vigência</label>
                        <Input
                          type="date"
                          value={formData.dataFimVigencia}
                          onChange={(e) => setFormData({...formData, dataFimVigencia: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Escola *</label>
                        <Select value={formData.schoolId} onValueChange={handleSchoolChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a escola" />
                          </SelectTrigger>
                          <SelectContent>
                            {getSchoolsFromSettings().map((school: any) => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Central de Compras *</label>
                        <Select 
                          value={formData.centralComprasId} 
                          onValueChange={(value) => setFormData({...formData, centralComprasId: value})}
                          disabled={!formData.schoolId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formData.schoolId ? "Selecione a central" : "Selecione uma escola primeiro"} />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailablePurchasingCenters().map((center: any) => (
                              <SelectItem key={center.id} value={center.id}>
                                {center.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.schoolId && getAvailablePurchasingCenters().length === 0 && (
                          <p className="text-sm text-orange-600 mt-1">
                            Nenhuma central de compras vinculada a esta escola. 
                            <br />
                            Verifique as configurações ou vincule a escola a uma central de compras.
                          </p>
                        )}
                        {!formData.schoolId && (
                          <p className="text-sm text-gray-500 mt-1">
                            Selecione uma escola para ver as centrais disponíveis.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Item addition section */}
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
                        <Select value={newItem.unidade} onValueChange={(value) => setNewItem({...newItem, unidade: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Unid" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kg">Kg</SelectItem>
                            <SelectItem value="Litro">Litro</SelectItem>
                            <SelectItem value="Unidade">Unidade</SelectItem>
                            <SelectItem value="Pacote">Pacote</SelectItem>
                          </SelectContent>
                        </Select>
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
                                  {item.quantidade} {item.unidade} x R$ {item.valorUnitario.toFixed(2)} = R$ {item.valorTotal.toFixed(2)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <div className="flex justify-between items-center pt-4 border-t">
                            <div>
                              <p className="font-bold">
                                Total: R$ {ataItems.reduce((sum, item) => sum + item.valorTotal, 0).toFixed(2)}
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

      case "gestao-atas":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Gestão de ATAs</h2>
            
            {atas.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">Nenhuma ATA cadastrada.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID ATA</TableHead>
                        <TableHead>Data ATA</TableHead>
                        <TableHead>Vigência</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {atas.map((ata) => (
                        <TableRow key={ata.id}>
                          <TableCell className="font-medium">{ata.numeroATA}</TableCell>
                          <TableCell>{ata.dataATA}</TableCell>
                          <TableCell>{ata.dataInicioVigencia} - {ata.dataFimVigencia}</TableCell>
                          <TableCell>R$ {ata.valorTotal.toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(ata.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewDetails(ata)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {ata.status === "rascunho" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleFinalizeATA(ata.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {ata.status === "finalizada" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleApproveATA(ata.id)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteATA(ata.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "vigencia":
        // ... keep existing code (vigencia tab implementation)
        const activeATAs = atas.filter(ata => ata.status === "aprovada");
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">ATAs em Vigência</h2>
            
            {activeATAs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">Nenhuma ATA aprovada em vigência encontrada.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeATAs.map((ata) => (
                  <Card key={ata.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">ATA: {ata.numeroATA}</h3>
                          <p className="text-gray-600">Valor: R$ {ata.valorTotal.toFixed(2)}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {ata.status}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-100 space-y-1">
                        <p className="text-sm">
                          <span className="text-gray-600">Vigência:</span> {ata.dataInicioVigencia} - {ata.dataFimVigencia}
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Itens:</span> {ata.items.length} produtos
                        </p>
                      </div>
                      <div className="mt-3 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleViewDetails(ata)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detalhes da ATA</DialogTitle>
                </DialogHeader>
                {selectedProcess && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium">ATA:</label>
                        <p>{selectedProcess.numeroATA}</p>
                      </div>
                      <div>
                        <label className="font-medium">Valor Total:</label>
                        <p>R$ {selectedProcess.valorTotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="font-medium">Data da ATA:</label>
                        <p>{selectedProcess.dataATA}</p>
                      </div>
                      <div>
                        <label className="font-medium">Vigência:</label>
                        <p>{selectedProcess.dataInicioVigencia} - {selectedProcess.dataFimVigencia}</p>
                      </div>
                      <div>
                        <label className="font-medium">Status:</label>
                        <p>{selectedProcess.status}</p>
                      </div>
                      <div>
                        <label className="font-medium">Quantidade de Itens:</label>
                        <p>{selectedProcess.items.length}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Itens da ATA:</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedProcess.items.map((item) => (
                          <div key={item.id} className="p-3 bg-gray-50 rounded-md">
                            <p className="font-medium">{item.numeroItem} - {item.descricaoProduto}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantidade} {item.unidade} x R$ {item.valorUnitario.toFixed(2)} = R$ {item.valorTotal.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );

      case "transferencia":
        const schools = getSchoolsFromSettings();
        const centers = getPurchasingCentersFromSettings();
        const approvedATAs = atas.filter(ata => ata.status === "aprovada");
        
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Transferência de Saldos</h2>
            
            {approvedATAs.length === 0 ? (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Nenhuma ATA aprovada disponível
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    Para realizar transferências de saldo, é necessário ter pelo menos uma ATA com status "Aprovada".
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ATA de Origem</label>
                    <select className="w-full border border-input rounded-md px-3 py-2">
                      <option>Selecione a ATA</option>
                      {approvedATAs.map((ata) => (
                        <option key={ata.id} value={ata.id}>{ata.numeroATA}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Escola de Origem</label>
                    <select className="w-full border border-input rounded-md px-3 py-2">
                      <option>Selecione a escola de origem</option>
                      {schools.map((school: any) => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Escola de Destino</label>
                    <select className="w-full border border-input rounded-md px-3 py-2">
                      <option>Selecione a escola de destino</option>
                      {schools.map((school: any) => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Central de Compras</label>
                    <select className="w-full border border-input rounded-md px-3 py-2">
                      <option>Selecione a central</option>
                      {centers.map((center: any) => (
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
                        <li>• Somente ATAs com status "Aprovada" podem ter saldos transferidos.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        );

      case "relatorios":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Relatórios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Exportar relatório personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                    <select className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Todas as escolas</option>
                      {getSchoolsFromSettings().map((school: any) => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                      ))}
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
          <h1 className="text-3xl font-bold" style={{ color: "#012340" }}>Planejamento</h1>
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
                  style={activeTab === tab.id 
                    ? { backgroundColor: "#012340", color: "white" }
                    : { backgroundColor: "#e5e7eb", color: "#374151" }
                  }
                  className="hover:opacity-90"
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
