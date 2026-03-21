import { useMemo, useState } from "react";
import { useData } from "../context/data-context";
import { useAuth } from "../context/auth-context";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ShoppingCart, Store, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function BuyerShop() {
  const { products } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      products
        .filter((product) => {
          const query = search.toLowerCase();
          return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.sellerName.toLowerCase().includes(query)
          );
        })
        .sort((a, b) => a.price - b.price),
    [products, search]
  );

  const myStock = filtered.filter((item) => item.sellerId === user?.id);
  const otherSellers = filtered.filter((item) => item.sellerId !== user?.id);

  const handleBuy = (itemName: string, sellerName: string, price: number) => {
    toast.success(`เพิ่ม ${itemName} ลงคำสั่งซื้อแล้ว`, {
      description: `ผู้ขาย: ${sellerName} • ราคา: ฿${price.toFixed(2)}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
        <h2 className="text-2xl font-bold text-gray-900">หน้าผู้ซื้อ</h2>
        <p className="mt-1 text-gray-700">
          หน้านี้สำหรับผู้ซื้อโดยเฉพาะ: ดูสินค้าที่คุณมี และสินค้าจากผู้ขายคนอื่น พร้อมกดซื้อเหมือนเว็บไซต์ขายของทั่วไป
        </p>
        <a
          href="https://data.moc.go.th/OpenData/GISProductPrice?product_id=P11012&from_date=2026-02-27&to_date=2026-02-28&task=search"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          เปิดหน้าราคาจริงจาก MOC
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อสินค้า หมวดหมู่ หรือผู้ขาย"
            className="pl-10"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">สินค้าที่มีในสต็อกของฉัน</h3>
          <Badge variant="secondary">{myStock.length}</Badge>
        </div>

        {myStock.length === 0 ? (
          <p className="text-sm text-gray-500">ยังไม่มีสินค้าที่คุณเป็นเจ้าของ</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {myStock.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">หมวดหมู่: {item.category}</p>
                <p className="text-sm text-gray-600">คงเหลือ {item.quantity.toLocaleString()} {item.unit}</p>
                <p className="mt-2 text-lg font-bold text-emerald-700">฿{item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">สินค้าจากผู้ขายคนอื่น</h3>
          <Badge variant="secondary">{otherSellers.length}</Badge>
        </div>

        {otherSellers.length === 0 ? (
          <p className="text-sm text-gray-500">ไม่พบสินค้าจากผู้ขายคนอื่นตามเงื่อนไขที่ค้นหา</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {otherSellers.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <p className="text-sm text-gray-600">ผู้ขาย: {item.sellerName}</p>
                <p className="text-sm text-gray-600">คงเหลือ {item.quantity.toLocaleString()} {item.unit}</p>
                <p className="mt-2 text-lg font-bold text-emerald-700">฿{item.price.toFixed(2)}</p>

                <Button
                  type="button"
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleBuy(item.name, item.sellerName, item.price)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  ซื้อสินค้า
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}