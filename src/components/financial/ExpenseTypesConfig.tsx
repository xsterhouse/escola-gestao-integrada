
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ExpenseTypesConfigProps {
  expenseTypes: string[];
  onExpenseTypesChange: (types: string[]) => void;
}

export function ExpenseTypesConfig({
  expenseTypes,
  onExpenseTypesChange,
}: ExpenseTypesConfigProps) {
  const [newType, setNewType] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAddType = () => {
    if (!newType.trim()) {
      toast.error("Nome do tipo de despesa é obrigatório");
      return;
    }

    if (expenseTypes.includes(newType.trim())) {
      toast.error("Tipo de despesa já existe");
      return;
    }

    onExpenseTypesChange([...expenseTypes, newType.trim()]);
    setNewType("");
    toast.success("Tipo de despesa adicionado com sucesso");
  };

  const handleDeleteType = (index: number) => {
    const newTypes = expenseTypes.filter((_, i) => i !== index);
    onExpenseTypesChange(newTypes);
    toast.success("Tipo de despesa removido com sucesso");
  };

  const handleEditType = (index: number) => {
    setEditingIndex(index);
    setEditingValue(expenseTypes[index]);
  };

  const handleSaveEdit = () => {
    if (!editingValue.trim()) {
      toast.error("Nome do tipo de despesa é obrigatório");
      return;
    }

    if (editingIndex !== null) {
      const newTypes = [...expenseTypes];
      newTypes[editingIndex] = editingValue.trim();
      onExpenseTypesChange(newTypes);
      setEditingIndex(null);
      setEditingValue("");
      toast.success("Tipo de despesa editado com sucesso");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Despesas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new type */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newType">Novo Tipo de Despesa</Label>
            <Input
              id="newType"
              placeholder="Ex: Equipamentos, Consultoria, Combustível..."
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddType}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Types list */}
        <div className="space-y-2">
          <Label>Tipos Existentes</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenseTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                {editingIndex === index ? (
                  <>
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{type}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleEditType(index)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteType(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
