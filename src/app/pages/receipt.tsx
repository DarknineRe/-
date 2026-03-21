import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Printer, ReceiptText, Store, Truck, MapPin, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { getBuyerReceiptById } from "../lib/buyer-receipt";

export function ReceiptPage() {
  const navigate = useNavigate();
  const { receiptId = "" } = useParams();
  const receipt = useMemo(() => getBuyerReceiptById(receiptId), [receiptId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    if (!receipt) return;

    const lines = [
      `ใบเสร็จ ${receipt.id}`,
      `วันที่: ${new Date(receipt.createdAt).toLocaleString("th-TH")}`,
      `ผู้ซื้อ: ${receipt.buyerName}`,
      `เบอร์โทร: ${receipt.buyerPhone}`,
      `วิธีรับสินค้า: ${receipt.pickupMethod === "pickup" ? "มารับที่ร้าน" : "จัดส่ง"}`,
      `สถานที่/ที่อยู่: ${receipt.locationDetail}`,
      receipt.note ? `หมายเหตุ: ${receipt.note}` : "",
      "",
      "รายการสินค้า",
      ...receipt.items.map(
        (item, index) =>
          `${index + 1}. ${item.name} (${item.workspaceName}/${item.sellerName}) x ${item.quantity} ${item.unit} @ ฿${item.unitPrice.toFixed(2)} = ฿${item.lineTotal.toFixed(2)}`
      ),
      "",
      `รวมทั้งสิ้น: ฿${receipt.subtotal.toFixed(2)}`,
    ].filter(Boolean);

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt.id}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="rounded-2xl p-8 text-center">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">ไม่พบใบเสร็จ</h1>
            <p className="mb-6 text-gray-600">ใบเสร็จนี้อาจถูกลบ หรือรหัสไม่ถูกต้อง</p>
            <Button onClick={() => navigate("/")}>กลับหน้าผู้ซื้อ</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fff9_0%,_#ffffff_55%,_#eef9f1_100%)] px-4 py-8 print:bg-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าผู้ซื้อ
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadText}>
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลด
            </Button>
            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700">
              <Printer className="mr-2 h-4 w-4" />
              พิมพ์ใบเสร็จ
            </Button>
          </div>
        </div>

        <Card className="rounded-[28px] border-emerald-100 p-8 shadow-sm print:shadow-none">
          <div className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                <ReceiptText className="h-4 w-4" />
                ใบเสร็จรับเงิน
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{receipt.id}</h1>
              <p className="text-sm text-gray-600">วันที่ {new Date(receipt.createdAt).toLocaleString("th-TH")}</p>
            </div>
            <Badge className="w-fit bg-emerald-600 px-4 py-1 text-sm">ชำระสำเร็จ</Badge>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-4">
              <h2 className="mb-2 font-semibold text-gray-900">ข้อมูลผู้ซื้อ</h2>
              <p className="text-sm text-gray-700">ชื่อ: {receipt.buyerName}</p>
              <p className="text-sm text-gray-700">โทร: {receipt.buyerPhone}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <h2 className="mb-2 font-semibold text-gray-900">วิธีรับสินค้า</h2>
              <p className="mb-1 flex items-center gap-2 text-sm text-gray-700">
                {receipt.pickupMethod === "pickup" ? <Store className="h-4 w-4 text-emerald-600" /> : <Truck className="h-4 w-4 text-emerald-600" />}
                {receipt.pickupMethod === "pickup" ? "มารับที่ร้าน" : "จัดส่งปลายทาง"}
              </p>
              <p className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{receipt.locationDetail}</span>
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">สินค้า</th>
                  <th className="px-4 py-3 text-left font-semibold">ผู้ขาย</th>
                  <th className="px-4 py-3 text-right font-semibold">จำนวน</th>
                  <th className="px-4 py-3 text-right font-semibold">ราคา/หน่วย</th>
                  <th className="px-4 py-3 text-right font-semibold">รวม</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr key={`${receipt.id}-${item.productId}`} className="border-t border-gray-200">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.workspaceName}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.sellerName}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-700">฿{item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">฿{item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-gray-600">ยอดรวมสุทธิ</span>
            <span className="text-3xl font-bold text-emerald-700">฿{receipt.subtotal.toFixed(2)}</span>
          </div>

          {receipt.note ? (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-medium">หมายเหตุจากผู้ซื้อ</p>
              <p className="mt-1">{receipt.note}</p>
            </div>
          ) : null}

          <div className="mt-6 text-sm text-gray-500">
            ต้องการสั่งซื้อเพิ่ม? ไปที่ <Link to="/" className="font-semibold text-emerald-700 underline">หน้าผู้ซื้อ</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}