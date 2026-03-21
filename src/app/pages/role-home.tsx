import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { useWorkspace } from "../context/workspace-context";
import { useAuth } from "../context/auth-context";
import { useData } from "../context/data-context";
import { ShoppingBasket, Store, Package, ArrowRightLeft, ChartColumnIncreasing } from "lucide-react";

export function RoleHome() {
  const { getUserRole, getUserPermissions } = useWorkspace();
  const { user } = useAuth();
  const { products } = useData();
  const permissions = getUserPermissions();
  const role = getUserRole();
  const isBuyer = role !== "owner" && !permissions.canAdd;

  if (isBuyer) {
    const availableCategories = new Set(products.map((item) => item.category)).size;
    const sellerCount = new Set(products.map((item) => item.sellerId)).size;
    const lowestPrice =
      products.length > 0
        ? Math.min(...products.map((item) => item.price))
        : 0;

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white">
              <ShoppingBasket className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">โหมดผู้ซื้อ</h2>
              <p className="text-gray-700">สวัสดี {user?.name || "ผู้ใช้งาน"} เลือกดูสินค้าจากผู้ค้าหลายรายแล้วเทียบราคาได้ทันที</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm text-gray-600">ผู้ค้าทั้งหมด</p>
            <p className="text-3xl font-bold text-gray-900">{sellerCount}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-600">หมวดหมู่ที่มีขาย</p>
            <p className="text-3xl font-bold text-gray-900">{availableCategories}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-600">ราคาเริ่มต้นต่ำสุด</p>
            <p className="text-3xl font-bold text-emerald-700">฿{lowestPrice.toFixed(2)}</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">ทางลัดสำหรับผู้ซื้อ</h3>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/marketplace">
                <Store className="mr-2 h-4 w-4" />
                เข้าตลาดกลาง
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/price-comparison">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                เปรียบเทียบราคา
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const myProducts =
    role === "owner"
      ? products
      : products.filter((item) => item.sellerId === user?.id);
  const totalUnits = myProducts.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedValue = myProducts.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">โหมดผู้ค้า</h2>
              {role === "owner" && <Badge>Admin</Badge>}
            </div>
            <p className="text-gray-700">จัดการสินค้า ตั้งราคา และติดตามมูลค่าสินค้าคงคลังของคุณ</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-gray-600">รายการสินค้าที่ดูแล</p>
          <p className="text-3xl font-bold text-gray-900">{myProducts.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-600">ปริมาณคงเหลือรวม</p>
          <p className="text-3xl font-bold text-gray-900">{totalUnits.toLocaleString()}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-600">มูลค่าโดยประมาณ</p>
          <p className="text-3xl font-bold text-emerald-700">฿{estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">ทางลัดสำหรับผู้ค้า</h3>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link to="/inventory">
              <Package className="mr-2 h-4 w-4" />
              ไปหน้าจัดการสต็อก
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/marketplace">
              <Store className="mr-2 h-4 w-4" />
              ดูตำแหน่งสินค้าในตลาดกลาง
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/price-comparison">
              <ChartColumnIncreasing className="mr-2 h-4 w-4" />
              เทียบราคากับตลาด
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}