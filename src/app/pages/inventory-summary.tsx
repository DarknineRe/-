import { useData } from "../context/data-context";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Package, TrendingUp, DollarSign, AlertCircle, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function InventorySummary() {
  const { products } = useData();

  // คำนวณสถิติ
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockProducts = products.filter((p) => p.quantity <= p.minStock);

  // จัดกลุ่มตามหมวดหมู่
  const categoryData = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = {
        name: category,
        count: 0,
        quantity: 0,
      };
    }
    acc[category].count += 1;
    acc[category].quantity += product.quantity;
    return acc;
  }, {} as Record<string, { name: string; count: number; quantity: number }>);

  const categoryChartData = Object.values(categoryData);
  const categoryPieData = Object.values(categoryData).map((cat) => ({
    name: cat.name,
    value: cat.count,
  }));

  // Top 5 สินค้าที่มีจำนวนมากที่สุด
  const topQuantityProducts = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">สรุปภาพรวมสต็อกสินค้า</h2>
        <p className="text-gray-600 mt-1">
          รายงานสรุปข้อมูลสินค้าคงคลังทั้งหมด
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">สินค้าทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-gray-500 mt-1">รายการ</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">จำนวนรวม</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalQuantity.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">หน่วย</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">สินค้าใกล้หมด</p>
              <p className="text-3xl font-bold text-red-600">
                {lowStockProducts.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">รายการ</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - จำนวนสินค้าตามหมวดหมู่ */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            จำนวนสินค้าตามหมวดหมู่
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="จำนวนรายการ" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart - สัดส่วนสินค้าตามหมวดหมู่ */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            สัดส่วนสินค้าตามหมวดหมู่
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category Summary Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          สรุปตามหมวดหมู่
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">จำนวนรายการ</TableHead>
                <TableHead className="text-right">ปริมาณรวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryChartData.map((category) => (
                <TableRow key={category.name}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">{category.count}</TableCell>
                  <TableCell className="text-right">
                    {category.quantity.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 font-bold">
                <TableCell>รวมทั้งหมด</TableCell>
                <TableCell className="text-right">{totalProducts}</TableCell>
                <TableCell className="text-right">
                  {totalQuantity.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Top 5 Products by Quantity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Top 5 สินค้าจำนวนมากที่สุด
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>อันดับ</TableHead>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">จำนวน</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topQuantityProducts.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Badge
                      className={
                        index === 0
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : index === 1
                          ? "bg-gray-400 hover:bg-gray-500"
                          : index === 2
                          ? "bg-orange-600 hover:bg-orange-700"
                          : ""
                      }
                    >
                      #{index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {product.quantity.toLocaleString()} {product.unit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                แจ้งเตือน: สินค้าใกล้หมด
              </h3>
              <p className="text-sm text-red-700 mb-3">
                มีสินค้า {lowStockProducts.length} รายการที่มีจำนวนต่ำกว่าหรือเท่ากับสต็อกขั้นต่ำ
              </p>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          คงเหลือ: {product.quantity} {product.unit}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">
                      สต็อกขั้นต่ำ: {product.minStock}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}