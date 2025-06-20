
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContractData, ContractDivergence } from "@/lib/types";
import { AlertTriangle, CheckCircle, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getATAByNumber } from "@/utils/ataUtils";
import { getCurrentISOString } from "@/lib/date-utils";

interface DivergenceEditModalProps {
  contract: ContractData;
  onUpdate: (contract: ContractData) => void;
  onClose: () => void;
}

export function DivergenceEditModal({
  contract,
  onUpdate,
  onClose
}: DivergenceEditModalProps) {
  const { toast } = useToast();
  const [editedItems, setEditedItems] = useState(
    contract.items.map(item => ({ ...item }))
  );
  const [isRevalidating, setIsRevalidating] = useState(false);

  const handleItemChange = (itemIndex: number, field: string, value: string | number) => {
    const updatedItems = [...editedItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [field]: field === 'precoUnitario' || field === 'quantidadeContratada' 
        ? parseFloat(value.toString()) || 0 
        : value
    };

    // Recalculate derived values
    if (field === 'precoUnitario' || field === 'quantidadeContratada') {
      const item = updatedItems[itemIndex];
      item.valorTotalContrato = (item.quantidadeContratada || 0) * (item.precoUnitario || 0);
      item.saldoQuantidade = (item.quantidadeContratada || 0) - (item.quantidadePaga || 0);
      item.saldoValor = (item.valorTotalContrato || 0) - (item.valorPago || 0);
    }

    setEditedItems(updatedItems);
  };

  const getSchoolIdFromPlanning = (ataNumber: string): string | null => {
    try {
      // Try to find the school ID by looking through all planning data
      const allSchools = JSON.parse(localStorage.getItem("schools") || "[]");
      
      for (const school of allSchools) {
        const schoolPlanning = JSON.parse(localStorage.getItem(`plans_${school.id}`) || "[]");
        const planningWithATA = schoolPlanning.find((p: any) => p.ataNumber === ataNumber);
        if (planningWithATA) {
          return school.id;
        }
      }
      
      // Fallback: use current user's school ID if available
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      return currentUser.schoolId || null;
    } catch (error) {
      console.error("Error finding school ID for ATA:", error);
      return null;
    }
  };

  const revalidateContract = async () => {
    if (!contract.ataId) return false;

    setIsRevalidating(true);

    try {
      // Get ATA data
      const ata = getATAByNumber(contract.ataId);
      if (!ata) {
        toast({
          title: "Erro na Revalidação",
          description: "ATA não encontrada",
          variant: "destructive",
        });
        return false;
      }

      // Get school ID for the ATA
      const schoolId = getSchoolIdFromPlanning(contract.ataId);
      if (!schoolId) {
        toast({
          title: "Erro na Revalidação",
          description: "Não foi possível encontrar a escola associada à ATA",
          variant: "destructive",
        });
        return false;
      }

      // Get planning items
      const ataPlanning = JSON.parse(localStorage.getItem(`plans_${schoolId}`) || "[]");
      const planningItems = ataPlanning.find(p => p.ataNumber === contract.ataId)?.items || [];

      // Revalidate items
      const newDivergences: ContractDivergence[] = [];

      editedItems.forEach((contractItem, contractIndex) => {
        const ataItem = planningItems.find(item => {
          const contractDesc = (contractItem.produto || contractItem.description).toLowerCase().trim();
          const ataDesc = item.description.toLowerCase().trim();
          
          const contractWords = contractDesc.split(' ');
          const ataWords = ataDesc.split(' ');
          const commonWords = contractWords.filter(word => 
            ataWords.some(ataWord => ataWord.includes(word) || word.includes(ataWord))
          );
          
          return commonWords.length >= Math.min(contractWords.length, ataWords.length) * 0.7;
        });

        if (!ataItem) {
          newDivergences.push({
            id: `div-${contractIndex}-notfound-${Date.now()}`,
            contractItemId: contractItem.id,
            itemId: '',
            field: 'descricao',
            type: 'specification',
            description: 'Item não encontrado na ATA',
            expectedValue: 'Não encontrado na ATA',
            actualValue: contractItem.produto || contractItem.description,
            valorContrato: contractItem.produto || contractItem.description,
            valorATA: 'Não encontrado na ATA',
            status: 'pending',
            contractId: contract.id,
            createdAt: getCurrentISOString()
          });
          return;
        }

        // Check for remaining divergences
        if ((contractItem.produto || contractItem.description).toLowerCase() !== ataItem.description.toLowerCase()) {
          newDivergences.push({
            id: `div-${contractIndex}-desc-${Date.now()}`,
            contractItemId: contractItem.id,
            itemId: ataItem.id,
            field: 'descricao',
            type: 'specification',
            description: 'Descrição divergente',
            expectedValue: ataItem.description,
            actualValue: contractItem.produto || contractItem.description,
            valorContrato: contractItem.produto || contractItem.description,
            valorATA: ataItem.description,
            status: 'pending',
            contractId: contract.id,
            createdAt: getCurrentISOString()
          });
        }

        if ((contractItem.quantidadeContratada || contractItem.quantity) > ataItem.quantity) {
          newDivergences.push({
            id: `div-${contractIndex}-qty-${Date.now()}`,
            contractItemId: contractItem.id,
            itemId: ataItem.id,
            field: 'quantidade',
            type: 'quantity',
            description: 'Quantidade divergente',
            expectedValue: ataItem.quantity.toString(),
            actualValue: (contractItem.quantidadeContratada || contractItem.quantity).toString(),
            valorContrato: contractItem.quantidadeContratada || contractItem.quantity,
            valorATA: ataItem.quantity,
            status: 'pending',
            contractId: contract.id,
            createdAt: getCurrentISOString()
          });
        }

        if (ataItem.unitPrice) {
          const tolerance = ataItem.unitPrice * 0.05;
          const priceDiff = Math.abs((contractItem.precoUnitario || contractItem.unitPrice) - ataItem.unitPrice);
          
          if (priceDiff > tolerance) {
            newDivergences.push({
              id: `div-${contractIndex}-price-${Date.now()}`,
              contractItemId: contractItem.id,
              itemId: ataItem.id,
              field: 'valorUnitario',
              type: 'price',
              description: 'Valor unitário divergente',
              expectedValue: ataItem.unitPrice.toString(),
              actualValue: (contractItem.precoUnitario || contractItem.unitPrice).toString(),
              valorContrato: contractItem.precoUnitario || contractItem.unitPrice,
              valorATA: ataItem.unitPrice,
              status: 'pending',
              contractId: contract.id,
              createdAt: getCurrentISOString()
            });
          }
        }
      });

      return newDivergences;

    } catch (error) {
      console.error("Error during revalidation:", error);
      toast({
        title: "Erro na Revalidação",
        description: "Erro ao validar alterações",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRevalidating(false);
    }
  };

  const handleSaveAndRevalidate = async () => {
    const newDivergences = await revalidateContract();
    
    if (newDivergences === false) return;

    const updatedContract: ContractData = {
      ...contract,
      items: editedItems,
      divergencias: newDivergences,
      status: newDivergences.length === 0 ? 'ativo' : 'divergencia_dados',
      ataValidated: newDivergences.length === 0,
      lastValidationAt: getCurrentISOString(),
      updatedAt: getCurrentISOString()
    };

    onUpdate(updatedContract);

    toast({
      title: newDivergences.length === 0 ? "Divergências Resolvidas" : "Alterações Salvas",
      description: newDivergences.length === 0 
        ? "Todas as divergências foram resolvidas. O contrato agora está ativo."
        : `Alterações salvas. ${newDivergences.length} divergência(s) ainda pendente(s).`,
      variant: newDivergences.length === 0 ? "default" : "destructive"
    });

    if (newDivergences.length === 0) {
      onClose();
    }
  };

  const unresolvedDivergences = contract.divergencias?.filter(d => d.status === 'pending') || [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Resolver Divergências - {contract.numeroContrato}
          </DialogTitle>
          <DialogDescription>
            Edite os itens do contrato para resolver as divergências encontradas.
            {unresolvedDivergences.length > 0 && (
              <span className="text-red-600 font-medium">
                {" "}{unresolvedDivergences.length} divergência(s) pendente(s).
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Divergences Summary */}
          {unresolvedDivergences.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Divergências Encontradas:</h4>
              <div className="space-y-1">
                {unresolvedDivergences.map((div) => (
                  <div key={div.id} className="text-sm text-yellow-700">
                    • <strong>{div.field === 'descricao' ? 'Descrição' : 
                              div.field === 'quantidade' ? 'Quantidade' : 
                              div.field === 'valorUnitario' ? 'Valor Unitário' : 
                              div.field}</strong>: 
                    {" "}{div.valorContrato} ≠ {div.valorATA}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editable Items Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Produto</TableHead>
                  <TableHead className="w-[120px]">Quantidade</TableHead>
                  <TableHead className="w-[120px]">Valor Unitário</TableHead>
                  <TableHead className="w-[120px]">Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedItems.map((item, index) => {
                  const itemDivergences = unresolvedDivergences.filter(
                    d => d.contractItemId === item.id
                  );
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.produto || item.description}
                          onChange={(e) => handleItemChange(index, 'produto', e.target.value)}
                          className={itemDivergences.some(d => d.field === 'descricao') ? 'border-yellow-300' : ''}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantidadeContratada || item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantidadeContratada', e.target.value)}
                          className={itemDivergences.some(d => d.field === 'quantidade') ? 'border-yellow-300' : ''}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.precoUnitario || item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'precoUnitario', e.target.value)}
                          className={itemDivergences.some(d => d.field === 'valorUnitario') ? 'border-yellow-300' : ''}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.valorTotalContrato || item.totalPrice)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {itemDivergences.length > 0 ? (
                          <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
                            {itemDivergences.length} divergência(s)
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Conforme
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveAndRevalidate}
            disabled={isRevalidating}
          >
            {isRevalidating ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Revalidando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar e Revalidar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
