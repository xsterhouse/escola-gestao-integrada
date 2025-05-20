
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

type ContractStatus = "open" | "closed" | "liquidated";

type ContractItem = {
  id: string;
  supplier: string;
  product: string;
  contractedQuantity: number;
  deliveredQuantity: number;
  paidAmount: number;
  status: ContractStatus;
  executionPercentage: number;
};

type ChartData = {
  name: string;
  value: number;
  color: string;
};

export function ContractReports() {
  const [supplier, setSupplier] = useState<string>("all");
  const [product, setProduct] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  
  // Mock data
  const contractItems: ContractItem[] = [
    {
      id: "1",
      supplier: "Editora Educação LTDA",
      product: "Livro Didático Matemática",
      contractedQuantity: 500,
      deliveredQuantity: 500,
      paidAmount: 22950,
      status: "liquidated",
      executionPercentage: 100,
    },
    {
      id: "2",
      supplier: "Papelaria Central",
      product: "Caderno Universitário",
      contractedQuantity: 1200,
      deliveredQuantity: 600,
      paidAmount: 9300,
      status: "open",
      executionPercentage: 50,
    },
    {
      id: "3",
      supplier: "Material Escolar S.A.",
      product: "Kit Lápis e Canetas",
      contractedQuantity: 800,
      deliveredQuantity: 400,
      paidAmount: 9100,
      status: "open",
      executionPercentage: 50,
    },
    {
      id: "4",
      supplier: "Editora Mapas",
      product: "Atlas Geográfico",
      contractedQuantity: 300,
      deliveredQuantity: 0,
      paidAmount: 0,
      status: "open",
      executionPercentage: 0,
    }
  ];

  // Filter items based on selected filters
  const filteredItems = contractItems.filter(item => 
    (supplier === "all" || item.supplier === supplier) &&
    (product === "all" || item.product === product) &&
    (status === "all" || item.status === status)
  );

  // Data for pie chart
  const pieData: ChartData[] = [
    { name: "Concluído", value: 25, color: "#22C55E" },
    { name: "Em Andamento", value: 50, color: "#3B82F6" },
    { name: "Não Iniciado", value: 25, color: "#F97316" }
  ];
  
  // Data for bar chart
  const barData = contractItems.map(item => ({
    name: item.product.length > 20 ? item.product.substring(0, 20) + '...' : item.product,
    contratado: item.contractedQuantity,
    entregue: item.deliveredQuantity,
  }));

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Relatórios de Contratos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier-filter">Fornecedor</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger id="supplier-filter">
                <SelectValue placeholder="Selecione o fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os fornecedores</SelectItem>
                <SelectItem value="Editora Educação LTDA">Editora Educação LTDA</SelectItem>
                <SelectItem value="Papelaria Central">Papelaria Central</SelectItem>
                <SelectItem value="Material Escolar S.A.">Material Escolar S.A.</SelectItem>
                <SelectItem value="Editora Mapas">Editora Mapas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-filter">Produto</Label>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger id="product-filter">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                <SelectItem value="Livro Didático Matemática">Livro Didático Matemática</SelectItem>
                <SelectItem value="Caderno Universitário">Caderno Universitário</SelectItem>
                <SelectItem value="Kit Lápis e Canetas">Kit Lápis e Canetas</SelectItem>
                <SelectItem value="Atlas Geográfico">Atlas Geográfico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="closed">Encerrado</SelectItem>
                <SelectItem value="liquidated">Liquidado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Contratado</TableHead>
                <TableHead className="text-right">Entregue</TableHead>
                <TableHead className="text-right">Pago</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{item.product}</TableCell>
                  <TableCell className="text-right">{item.contractedQuantity}</TableCell>
                  <TableCell className="text-right">{item.deliveredQuantity}</TableCell>
                  <TableCell className="text-right">
                    R$ {item.paidAmount.toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Execução de Contratos</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quantidades por Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="contratado" name="Contratado" fill="#8884d8" />
                    <Bar dataKey="entregue" name="Entregue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ContractStatus }) {
  const statusConfig = {
    open: { label: "Aberto", className: "bg-blue-100 text-blue-800" },
    closed: { label: "Encerrado", className: "bg-orange-100 text-orange-800" },
    liquidated: { label: "Liquidado", className: "bg-green-100 text-green-800" }
  };
  
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
