import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { PurchasingCenter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalStorageSync } from "@/hooks/useLocalStorageSync";
import { Trash } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  schoolIds: z.array(z.string()).optional(),
});

interface PurchasingCenterFormValues {
  name: string;
  description?: string;
  schoolIds?: string[];
}

export function PurchasingCenterTab() {
  const [open, setOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<PurchasingCenter | null>(null);
  const { toast } = useToast();
  const { data: centers, saveData: setCenters } = useLocalStorageSync<PurchasingCenter>('purchasing-centers', []);

  const form = useForm<PurchasingCenterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      schoolIds: [],
    },
  });

  const [formData, setFormData] = useState<PurchasingCenterFormValues>({
    name: "",
    description: "",
    schoolIds: [],
  });

  useEffect(() => {
    if (editingCenter) {
      setFormData({
        name: editingCenter.name,
        description: editingCenter.description || "",
        schoolIds: editingCenter.schoolIds || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        schoolIds: [],
      });
    }
  }, [editingCenter]);

  const handleOpen = () => {
    setEditingCenter(null);
    setOpen(true);
  };

  const handleEdit = (center: PurchasingCenter) => {
    setEditingCenter(center);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCenter(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da central é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const centerData: PurchasingCenter = {
      id: editingCenter?.id || uuidv4(),
      name: formData.name,
      code: formData.name.replace(/\s+/g, '').substring(0, 10).toUpperCase(), // Generate code from name
      description: formData.description,
      schoolIds: formData.schoolIds,
      status: "active",
      createdAt: editingCenter?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingCenter) {
      // Update existing center
      const updatedCenters = centers.map(center =>
        center.id === editingCenter.id ? centerData : center
      );
      setCenters(updatedCenters);
      toast({
        title: "Central atualizada",
        description: "Central de compras atualizada com sucesso.",
      });
    } else {
      // Create new center
      setCenters([...centers, centerData]);
      toast({
        title: "Central criada",
        description: "Central de compras criada com sucesso.",
      });
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta central?")) {
      const updatedCenters = centers.filter(center => center.id !== id);
      setCenters(updatedCenters);
      toast({
        title: "Central excluída",
        description: "Central de compras excluída com sucesso.",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Centrais de Compras</h2>
        <Button onClick={handleOpen}>Adicionar Central</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {centers.map(center => (
            <TableRow key={center.id}>
              <TableCell className="font-medium">{center.name}</TableCell>
              <TableCell>{center.description}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => handleEdit(center)}>
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(center.id)}>
                  <Trash className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCenter ? "Editar Central" : "Nova Central"}</DialogTitle>
            <DialogDescription>
              {editingCenter
                ? "Atualize os dados da central de compras."
                : "Cadastre uma nova central de compras no sistema."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="w-full">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome da central"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Descrição da central"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
