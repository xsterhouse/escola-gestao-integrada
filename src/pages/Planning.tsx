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
import { Eye, Plus, Trash2, Save, Download, FileText, BarChart3, CheckCircle, Clock, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isSchoolLinkedToPurchasingCenter } from "@/utils/schoolPurchasingSync";
import { VigencyCounter } from "@/components/planning/VigencyCounter";
import { TransferFormComponent } from "@/components/planning/TransferFormComponent";
import { TransferTable } from "@/components/planning/TransferTable";

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
  numeroATA: string;
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVigencyItemsModalOpen, setIsVigencyItemsModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ATA | null>(null);
  const [selectedVigencyATA, setSelectedVigencyATA] = useState<ATA | null>(null);
  const [ataToDelete, setAtaToDelete] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteJustification, setDeleteJustification] = useState("");
  const [atas, setAtas] = useState<ATA[]>([]);
  const [ataItems, setAtaItems] = useState<ATAItem[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
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
      console.log("📚 Escolas carregadas:", schools);
      return schools;
    } catch {
      return [];
    }
  };

  const getPurchasingCentersFromSettings = () => {
    try {
      const storageData = localStorage.getItem("purchasing-centers");
      console.log("🏢 Dados brutos das centrais:", storageData);
      
      if (!storageData) return [];
      
      const parsedData = JSON.parse(storageData);
      console.log("📋 Dados parseados das centrais:", parsedData);
      
      // Se for um array de objetos com propriedade 'data', extrair os dados
      if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].data) {
        const centers = parsedData.map(item => item.data);
        console.log("🏢 Centrais extraídas (com .data):", centers);
        return centers;
      }
      
      // Se for um array direto, retornar como está
      if (Array.isArray(parsedData)) {
        console.log("🏢 Centrais diretas:", parsedData);
        return parsedData;
      }
      
      return [];
    } catch (error) {
      console.error("❌ Erro ao carregar centrais de compras:", error);
      return [];
    }
  };

  // Get purchasing centers filtered by selected school with improved logic
  const getAvailablePurchasingCenters = () => {
    const allCenters = getPurchasingCentersFromSettings();
    console.log("🔍 Todas as centrais disponíveis:", allCenters);
    console.log("🎯 Escola selecionada:", formData.schoolId);
    
    if (!formData.schoolId) {
      console.log("⚠️ Nenhuma escola selecionada, retornando array vazio");
      return [];
    }
    
    // Filtrar centrais usando verificação bidirecional
    const filteredCenters = allCenters.filter(center => {
      const isLinked = isSchoolLinkedToPurchasingCenter(formData.schoolId, center.id);
      
      console.log(`🔗 Verificando central ${center.name}:`, {
        centerId: center.id,
        centerSchoolIds: center.schoolIds,
        selectedSchoolId: formData.schoolId,
        isLinked
      });
      
      return isLinked;
    });
    
    console.log("✅ Centrais filtradas para a escola:", filteredCenters);
    return filteredCenters;
  };

  const tabs = [
    { id: "nova-ata", label: "Nova ATA" },
    { id: "gestao-atas", label: "Gestão de ATAs" },
    { id: "vigencia", label: "Vigência" },
    { id: "relatorios", label: "Relatórios" },
    { id: "transferencia", label: "Transferência de Saldos" },
    { id: "historico", label: "Histórico" }
  ];

  const handleViewDetails = (ata: ATA) => {
    setSelectedProcess(ata);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (ataId: string) => {
    setAtaToDelete(ataId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletePassword || !deleteJustification) {
      toast({
        title: "Erro",
        description: "Senha e justificativa são obrigatórias",
        variant: "destructive"
      });
      return;
    }

    if (ataToDelete) {
      const updatedATAs = atas.filter(ata => ata.id !== ataToDelete);
      saveATAs(updatedATAs);
      setIsDeleteModalOpen(false);
      setDeletePassword("");
      setDeleteJustification("");
      setAtaToDelete(null);
      
      toast({
        title: "ATA excluída",
        description: "ATA foi excluída com sucesso"
      });
    }
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
    console.log("🎯 Escola selecionada:", schoolId);
    setFormData(prev => ({
      ...prev,
      schoolId,
      centralComprasId: ""
    }));
  };

  const handleVigencyCardClick = (ata: ATA) => {
    setSelectedVigencyATA(ata);
    setIsVigencyItemsModalOpen(true);
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
    
    setFormData({
      dataATA: "",
      dataInicioVigencia: "",
      dataFimVigencia: "",
      schoolId: "",
      centralComprasId: ""
    });
    setAtaItems([]);
    setIsNewATAModalOpen(false);
    setActiveTab("gestao-atas");

    toast({
      title: "ATA salva",
      description: `ATA ${newATA.numeroATA} foi salva com sucesso e está pendente de aprovação`
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

  const handleTransferSaved = (transfer: any) => {
    setTransfers(prev => [...prev, transfer]);
    
    const existingTransfers = JSON.parse(localStorage.getItem("transfers") || "[]");
    localStorage.setItem("transfers", JSON.stringify([...existingTransfers, transfer]));
  };

  const handleDeleteTransfer = (transferId: string, password: string, justification: string) => {
    const transferToDelete = transfers.find(t => t.id === transferId);
    if (transferToDelete) {
      const historyEntry = {
        ...transferToDelete,
        deletedAt: new Date().toISOString(),
        deletePassword: password,
        deleteJustification: justification,
        action: "deleted"
      };
      
      setTransferHistory(prev => [...prev, historyEntry]);
      setTransfers(prev => prev.filter(t => t.id !== transferId));
      
      const remainingTransfers = transfers.filter(t => t.id !== transferId);
      localStorage.setItem("transfers", JSON.stringify(remainingTransfers));
      
      const existingHistory = JSON.parse(localStorage.getItem("transferHistory") || "[]");
      localStorage.setItem("transferHistory", JSON.stringify([...existingHistory, historyEntry]));
      
      toast({
        title: "Transferência excluída",
        description: "A transferência foi movida para o histórico"
      });
    }
  };

  // Load transfers from localStorage
  useEffect(() => {
    const storedTransfers = JSON.parse(localStorage.getItem("transfers") || "[]");
    const storedHistory = JSON.parse(localStorage.getItem("transferHistory") || "[]");
    setTransfers(storedTransfers);
    setTransferHistory(storedHistory);
  }, []);

  const handleExportReport = (format: 'pdf' | 'excel') => {
    toast({
      title: "Exportando relatório",
      description: `Relatório em formato ${format.toUpperCase()} será baixado em instantes`
    });
    
    console.log(`Exporting report in ${format} format`);
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
                            <SelectItem value="Frc">Frc</SelectItem>
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
                                title="Visualizar detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {ata.status === "rascunho" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleFinalizeATA(ata.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Finalizar ATA"
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
                                  title="Aprovar ATA"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteClick(ata.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Excluir ATA"
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
        const activeATAs = atas.filter(ata => ata.status === "aprovada");
        return (
          <div className="space-y-6">
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
                  <div key={ata.id} onClick={() => handleVigencyCardClick(ata)} className="cursor-pointer">
                    <VigencyCounter
                      endDate={new Date(ata.dataFimVigencia)}
                      ataNumber={ata.numeroATA}
                    />
                  </div>
                ))}
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
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => handleExportReport('pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      onClick={() => handleExportReport('excel')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center h-12 w-12 bg-blue-100 text-blue-600 rounded-full mb-3 mx-auto">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-center">Relatório por Produto</h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">Visualize a distribuição de um produto específico entre as escolas da rede municipal.</p>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => handleExportReport('pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleExportReport('excel')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
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
                      <Button 
                        className="flex-1" 
                        size="sm"
                        onClick={() => handleExportReport('pdf')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700" 
                        size="sm"
                        onClick={() => handleExportReport('excel')}
                      >
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
        const schools = getSchoolsFromSettings();
        const centers = getPurchasingCentersFromSettings();
        const approvedATAs = atas.filter(ata => ata.status === "aprovada");
        
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Transferência de Saldos</h2>
            
            <TransferFormComponent
              schools={schools}
              centers={centers}
              approvedATAs={approvedATAs}
              onTransferSaved={handleTransferSaved}
            />
            
            <TransferTable
              transfers={transfers}
              onDeleteTransfer={handleDeleteTransfer}
              schools={schools}
              centers={centers}
            />
          </div>
        );

      case "historico":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Histórico de Operações</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Transferências
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transferHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum histórico de transferências encontrado.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data Operação</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>ATA</TableHead>
                          <TableHead>Escola Origem</TableHead>
                          <TableHead>Escola Destino</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Justificativa Exclusão</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transferHistory.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              {new Date(entry.deletedAt || entry.createdAt).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={entry.action === "deleted" ? "destructive" : "secondary"}>
                                {entry.action === "deleted" ? "Excluída" : "Criada"}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.ataId}</TableCell>
                            <TableCell>{getSchoolsFromSettings().find((s: any) => s.id === entry.schoolOriginId)?.name || "N/A"}</TableCell>
                            <TableCell>
                              {entry.schoolDestinationId ? 
                                getSchoolsFromSettings().find((s: any) => s.id === entry.schoolDestinationId)?.name || "N/A" : 
                                "N/A"
                              }
                            </TableCell>
                            <TableCell>{entry.quantity}</TableCell>
                            <TableCell>{entry.deleteJustification || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
            <div className="flex space-x-2 border-b pb-4 overflow-x-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  style={activeTab === tab.id 
                    ? { backgroundColor: "#012340", color: "white" }
                    : { backgroundColor: "#e5e7eb", color: "#374151" }
                  }
                  className="hover:opacity-90 whitespace-nowrap"
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

        {/* Modal de Visualização de ATA */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da ATA {selectedProcess?.numeroATA}</DialogTitle>
            </DialogHeader>
            {selectedProcess && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium">Data da ATA:</label>
                    <p>{selectedProcess.dataATA}</p>
                  </div>
                  <div>
                    <label className="font-medium">Status:</label>
                    <p>{getStatusBadge(selectedProcess.status)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium">Início da Vigência:</label>
                    <p>{selectedProcess.dataInicioVigencia}</p>
                  </div>
                  <div>
                    <label className="font-medium">Fim da Vigência:</label>
                    <p>{selectedProcess.dataFimVigencia}</p>
                  </div>
                </div>
                <div>
                  <label className="font-medium">Valor Total:</label>
                  <p>R$ {selectedProcess.valorTotal.toFixed(2)}</p>
                </div>
                <div>
                  <label className="font-medium mb-2 block">Itens da ATA:</label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Item</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                        <TableHead>Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProcess.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.numeroItem}</TableCell>
                          <TableCell>{item.descricaoProduto}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.unidade}</Badge>
                          </TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>R$ {item.valorUnitario.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">R$ {item.valorTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Exclusão de ATA */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão da ATA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Para excluir esta ATA, digite sua senha e justificativa:</p>
              <div>
                <label className="block text-sm font-medium mb-1">Senha *</label>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Digite sua senha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Justificativa *</label>
                <Textarea
                  value={deleteJustification}
                  onChange={(e) => setDeleteJustification(e.target.value)}
                  placeholder="Justifique a exclusão..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Confirmar Exclusão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Itens da Vigência */}
        <Dialog open={isVigencyItemsModalOpen} onOpenChange={setIsVigencyItemsModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Itens da ATA {selectedVigencyATA?.numeroATA}</DialogTitle>
            </DialogHeader>
            {selectedVigencyATA && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-medium">Vigência:</label>
                    <p>{selectedVigencyATA.dataInicioVigencia} até {selectedVigencyATA.dataFimVigencia}</p>
                  </div>
                  <div>
                    <label className="font-medium">Status:</label>
                    <p>{getStatusBadge(selectedVigencyATA.status)}</p>
                  </div>
                  <div>
                    <label className="font-medium">Valor Total:</label>
                    <p>R$ {selectedVigencyATA.valorTotal.toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <label className="font-medium mb-2 block">Itens da ATA:</label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Item</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                        <TableHead>Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedVigencyATA.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.numeroItem}</TableCell>
                          <TableCell>{item.descricaoProduto}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.unidade}</Badge>
                          </TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>R$ {item.valorUnitario.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">R$ {item.valorTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Planning;
