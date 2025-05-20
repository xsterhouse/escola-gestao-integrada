
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface ContractReport {
  id: number;
  supplier: string;
  product: string;
  contractedQty: number;
  deliveredQty: number;
  paidQty: number;
  status: "open" | "closed" | "settled";
}

export default function ContractsReports() {
  const [filter, setFilter] = useState({
    supplier: "",
    product: "",
    status: ""
  });

  const [reports, setReports] = useState<ContractReport[]>([
    { id: 1, supplier: "Papelaria ABC", product: "Caderno 96 folhas", contractedQty: 500, deliveredQty: 500, paidQty: 500, status: "settled" },
    { id: 2, supplier: "Material Escolar Ltda", product: "Lápis HB", contractedQty: 2000, deliveredQty: 100, paidQty: 100, status: "open" },
    { id: 3, supplier: "Papelaria ABC", product: "Borracha branca", contractedQty: 1000, deliveredQty: 500, paidQty: 500, status: "open" },
    { id: 4, supplier: "Material Escolar Ltda", product: "Caneta esferográfica azul", contractedQty: 1500, deliveredQty: 50, paidQty: 50, status: "open" },
    { id: 5, supplier: "Distribuidora XYZ", product: "Agenda escolar", contractedQty: 300, deliveredQty: 300, paidQty: 150, status: "closed" },
  ]);

  // Calculate execution percentages for pie chart
  const statuses = [
    { name: "Liquidado", value: reports.filter(r => r.status === "settled").length },
    { name: "Encerrado", value: reports.filter(r => r.status === "closed").length },
    { name: "Aberto", value: reports.filter(r => r.status === "open").length },
  ];

  // Calculate delivery percentages for bar chart
  const suppliers = [...new Set(reports.map(r => r.supplier))];
  const deliveryData = suppliers.map(supplier => {
    const supplierReports = reports.filter(r => r.supplier === supplier);
    const contracted = supplierReports.reduce((sum, r) => sum + r.contractedQty, 0);
    const delivered = supplierReports.reduce((sum, r) => sum + r.deliveredQty, 0);
    const percentDelivered = contracted > 0 ? (delivered / contracted) * 100 : 0;
    
    return {
      name: supplier,
      percentDelivered: Math.round(percentDelivered)
    };
  });

  // Apply filters
  const filteredReports = reports.filter(report => {
    return (
      (filter.supplier === "" || report.supplier.toLowerCase().includes(filter.supplier.toLowerCase())) &&
      (filter.product === "" || report.product.toLowerCase().includes(filter.product.toLowerCase())) &&
      (filter.status === "" || report.status === filter.status)
    );
  });

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios de Contratos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="supplier-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <Input
                  id="supplier-filter"
                  value={filter.supplier}
                  onChange={(e) => setFilter({ ...filter, supplier: e.target.value })}
                  placeholder="Filtrar por fornecedor"
                  className="h-9"
                />
              </div>
              <div>
                <label htmlFor="product-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Produto
                </label>
                <Input
                  id="product-filter"
                  value={filter.product}
                  onChange={(e) => setFilter({ ...filter, product: e.target.value })}
                  placeholder="Filtrar por produto"
                  className="h-9"
                />
              </div>
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Contrato
                </label>
                <Select
                  value={filter.status}
                  onValueChange={(value) => setFilter({ ...filter, status: value })}
                >
                  <SelectTrigger id="status-filter" className="h-9">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="closed">Encerrado</SelectItem>
                    <SelectItem value="settled">Liquidado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade Contratada</TableHead>
                  <TableHead>Entregue</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Nenhum resultado encontrado para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report, index) => (
                    <TableRow key={report.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <TableCell>{report.supplier}</TableCell>
                      <TableCell>{report.product}</TableCell>
                      <TableCell>{report.contractedQty}</TableCell>
                      <TableCell>
                        {report.deliveredQty} ({Math.round((report.deliveredQty / report.contractedQty) * 100)}%)
                      </TableCell>
                      <TableCell>
                        {report.paidQty} ({Math.round((report.paidQty / report.contractedQty) * 100)}%)
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === "open" 
                            ? "bg-blue-100 text-blue-800" 
                            : report.status === "closed" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {report.status === "open" 
                            ? "Aberto" 
                            : report.status === "closed" 
                            ? "Encerrado" 
                            : "Liquidado"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Status dos Contratos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statuses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statuses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} contratos`, 'Quantidade']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Percentual de Entrega por Fornecedor</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deliveryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Entregue']} />
                    <Legend />
                    <Bar dataKey="percentDelivered" name="% Entregue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
