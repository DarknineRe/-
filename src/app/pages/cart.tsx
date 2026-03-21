import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Package, ShoppingCart, Store, Truck, UserRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/auth-context";
import { API_BASE } from "../../api";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { clearBuyerCart, getBuyerCart, getBuyerCartQuantity, removeBuyerCartItem, updateBuyerCartItem } from "../lib/buyer-cart";
import { createReceiptId, saveBuyerReceipt } from "../lib/buyer-receipt";
import { toast } from "sonner";

interface BuyerProduct {
  id: string;
  name: string;
  sellerName: string;
  workspaceName: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export function CartPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [products, setProducts] = useState<BuyerProduct[]>([]);
  const [cartVersion, setCartVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupMethod, setPickupMethod] = useState<"pickup" | "delivery">("pickup");
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || "");
  const [locationDetail, setLocationDetail] = useState(user?.address || "");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBuyerName(user?.name || "");
    setBuyerPhone(user?.phone || "");
    setLocationDetail(user?.address || "");
  }, [user]);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/api/public/products`);
        const data = await response.json();
        if (!ignore) {
          setProducts(
            Array.isArray(data)
              ? data.map((item) => ({
                  id: String(item.id),
                  name: String(item.name || ""),
                  sellerName: String(item.seller_name ?? item.sellerName ?? "ไม่ระบุผู้ขาย"),
                  workspaceName: String(item.workspace_name ?? item.workspaceName ?? "ทั่วไป"),
                  price: Number(item.price ?? 0),
                  quantity: Number(item.quantity ?? 0),
                  unit: String(item.unit || "หน่วย"),
                  imageUrl: item.image_url ?? item.imageUrl ?? undefined,
                }))
              : []
          );
        }
      } catch (error) {
        if (!ignore) {
          toast.error("โหลดรายการสินค้าในตะกร้าไม่สำเร็จ");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [cartVersion]);

  const cartItems = useMemo(() => getBuyerCart(), [cartVersion]);

  const detailedItems = useMemo(
    () =>
      cartItems
        .map((cartItem) => {
          const product = products.find((item) => item.id === cartItem.productId);
          return product
            ? {
                ...product,
                cartQuantity: Math.min(cartItem.quantity, product.quantity),
              }
            : null;
        })
        .filter((item): item is BuyerProduct & { cartQuantity: number } => Boolean(item)),
    [cartItems, products]
  );

  const subtotal = detailedItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

  const handleQuantityChange = (productId: string, nextQuantity: number) => {
    updateBuyerCartItem(productId, nextQuantity);
    setCartVersion((value) => value + 1);
  };

  const handleRemove = (productId: string) => {
    removeBuyerCartItem(productId);
    setCartVersion((value) => value + 1);
    toast.success("ลบสินค้าออกจากตะกร้าแล้ว");
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนสั่งซื้อ");
      navigate(`/login?mode=buyer&redirect=${encodeURIComponent("/cart")}`);
      return;
    }

    if (!buyerName.trim() || !buyerPhone.trim()) {
      toast.error("กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบ");
      return;
    }

    if (!locationDetail.trim()) {
      toast.error(pickupMethod === "pickup" ? "กรุณาระบุร้านหรือจุดรับสินค้า" : "กรุณาระบุที่อยู่จัดส่ง");
      return;
    }

    if (detailedItems.length === 0) {
      toast.error("ยังไม่มีสินค้าในตะกร้า");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: buyerName,
        photoUrl: user?.photoUrl,
        phone: buyerPhone,
        address: locationDetail,
      });

      const receiptId = createReceiptId();
      saveBuyerReceipt({
        id: receiptId,
        createdAt: new Date().toISOString(),
        buyerId: user?.id || "guest",
        buyerName,
        buyerPhone,
        pickupMethod,
        locationDetail,
        note,
        subtotal,
        items: detailedItems.map((item) => ({
          productId: item.id,
          name: item.name,
          workspaceName: item.workspaceName,
          sellerName: item.sellerName,
          unitPrice: item.price,
          quantity: item.cartQuantity,
          unit: item.unit,
          lineTotal: item.price * item.cartQuantity,
        })),
      });

      clearBuyerCart();
      setCartVersion((value) => value + 1);
      toast.success("ส่งคำสั่งซื้อเรียบร้อย", {
        description: pickupMethod === "pickup" ? "ระบบบันทึกเป็นการรับที่ร้านแล้ว" : "ระบบบันทึกเป็นการจัดส่งตามที่อยู่แล้ว",
      });
      navigate(`/receipt/${encodeURIComponent(receiptId)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.14),_transparent_28%),linear-gradient(180deg,_#f7fff8_0%,_#ffffff_40%,_#eefaf1_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button variant="ghost" className="mb-3 px-0 text-gray-600" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปเลือกสินค้า
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
            <p className="text-gray-600">ตรวจสอบรายการสินค้าและกำหนดวิธีรับสินค้า</p>
          </div>
          <Badge className="w-fit bg-emerald-600 px-4 py-1.5 text-sm">{getBuyerCartQuantity(cartItems)} ชิ้นในตะกร้า</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-6">กำลังโหลดตะกร้า...</Card>
            ) : detailedItems.length === 0 ? (
              <Card className="rounded-[28px] p-10 text-center">
                <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h2 className="mb-2 text-xl font-semibold text-gray-900">ยังไม่มีสินค้าในตะกร้า</h2>
                <p className="mb-6 text-gray-600">เลือกสินค้าในหน้าผู้ซื้อก่อนแล้วกลับมาชำระรายการที่นี่</p>
                <Button onClick={() => navigate("/")}>ไปหน้าเลือกสินค้า</Button>
              </Card>
            ) : (
              detailedItems.map((item) => (
                <Card key={item.id} className="rounded-[28px] p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="h-28 w-full overflow-hidden rounded-2xl bg-emerald-50 md:w-32">
                      {item.imageUrl ? (
                        <ImageWithFallback src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-emerald-600">
                          <Package className="h-10 w-10 opacity-60" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                          <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                            <Store className="h-4 w-4 text-emerald-600" />
                            {item.workspaceName} • {item.sellerName}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">คงเหลือ {item.quantity.toLocaleString()} {item.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-700">฿{item.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">ต่อ {item.unit}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.id, item.cartQuantity - 1)}>
                            -
                          </Button>
                          <div className="min-w-14 rounded-xl bg-gray-50 px-3 py-2 text-center text-sm font-semibold">
                            {item.cartQuantity}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.id, Math.min(item.cartQuantity + 1, item.quantity))}>
                            +
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold text-gray-900">รวม ฿{(item.cartQuantity * item.price).toFixed(2)}</p>
                          <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleRemove(item.id)}>
                            ลบ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-4">
            <Card className="rounded-[28px] p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">ข้อมูลผู้ซื้อ</h2>
              {!isAuthenticated ? (
                <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-900">ต้องเข้าสู่ระบบหรือสมัครสมาชิกก่อนจึงจะยืนยันการสั่งซื้อได้</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button onClick={() => navigate(`/login?mode=buyer&redirect=${encodeURIComponent("/cart")}`)}>เข้าสู่ระบบผู้ซื้อ</Button>
                    <Button variant="outline" onClick={() => navigate(`/register?mode=buyer&redirect=${encodeURIComponent("/cart")}`)}>
                      สมัครสมาชิกผู้ซื้อ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div className="flex items-center gap-2 font-medium">
                      <UserRound className="h-4 w-4" />
                      โปรไฟล์ผู้ซื้อ
                    </div>
                    <p className="mt-1">บันทึกข้อมูลนี้ไว้ใช้กับการซื้อครั้งต่อไปได้ และแก้ไขภายหลังที่ <Link to="/profile" className="font-semibold underline">หน้าโปรไฟล์</Link></p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyerName">ชื่อผู้ซื้อ</Label>
                    <Input id="buyerName" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyerPhone">เบอร์โทรศัพท์</Label>
                    <Input id="buyerPhone" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
                  </div>
                </div>
              )}
            </Card>

            <Card className="rounded-[28px] p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">วิธีรับสินค้า</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPickupMethod("pickup")}
                  className={`rounded-2xl border p-4 text-left ${pickupMethod === "pickup" ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}`}
                >
                  <MapPin className="mb-2 h-5 w-5 text-emerald-700" />
                  <p className="font-semibold text-gray-900">มารับที่ร้าน</p>
                  <p className="text-sm text-gray-600">ระบุร้านหรือจุดรับสินค้า</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPickupMethod("delivery")}
                  className={`rounded-2xl border p-4 text-left ${pickupMethod === "delivery" ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}`}
                >
                  <Truck className="mb-2 h-5 w-5 text-emerald-700" />
                  <p className="font-semibold text-gray-900">จัดส่งตามที่อยู่</p>
                  <p className="text-sm text-gray-600">ระบุจุดส่งหรือที่อยู่ปลายทาง</p>
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="locationDetail">{pickupMethod === "pickup" ? "ร้านหรือจุดรับสินค้า" : "ที่อยู่จัดส่ง"}</Label>
                <Textarea
                  id="locationDetail"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder={pickupMethod === "pickup" ? "เช่น มารับที่หน้าร้าน ตลาดกลางโซน A" : "เช่น 99/12 หมู่ 5 ตำบล..."}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="note">หมายเหตุเพิ่มเติม</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น โทรก่อนมาส่ง หรือขอรับช่วงเย็น"
                />
              </div>
            </Card>

            <Card className="rounded-[28px] p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-3 text-sm">
                {detailedItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-500">{item.cartQuantity} x ฿{item.price.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold text-gray-900">฿{(item.price * item.cartQuantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-gray-600">ยอดรวม</span>
                <span className="text-2xl font-bold text-emerald-700">฿{subtotal.toFixed(2)}</span>
              </div>
              <Button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleCheckout} disabled={isSubmitting || detailedItems.length === 0}>
                {isSubmitting ? "กำลังยืนยัน..." : "ยืนยันการสั่งซื้อ"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}