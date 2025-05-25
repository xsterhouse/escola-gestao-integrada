
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ResourceCategoriesConfigProps {
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function ResourceCategoriesConfig({
  categories,
  onCategoriesChange,
}: ResourceCategoriesConfigProps) {
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error("Categoria já existe");
      return;
    }

    onCategoriesChange([...categories, newCategory.trim()]);
    setNewCategory("");
    toast.success("Categoria adicionada com sucesso");
  };

  const handleDeleteCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    onCategoriesChange(newCategories);
    toast.success("Categoria removida com sucesso");
  };

  const handleEditCategory = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const handleSaveEdit = () => {
    if (!editingValue.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    if (editingIndex !== null) {
      const newCategories = [...categories];
      newCategories[editingIndex] = editingValue.trim();
      onCategoriesChange(newCategories);
      setEditingIndex(null);
      setEditingValue("");
      toast.success("Categoria editada com sucesso");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorias de Recursos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new category */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newCategory">Nova Categoria</Label>
            <Input
              id="newCategory"
              placeholder="Ex: PDDE, Estadual, Municipal..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Categories list */}
        <div className="space-y-2">
          <Label>Categorias Existentes</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((category, index) => (
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
                    <span className="flex-1">{category}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleEditCategory(index)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(index)}>
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
