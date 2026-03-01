import { useData } from "../context/data-context";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Lightbulb,
  TrendingUp,
  Calendar,
  DollarSign,
  Sprout,
  ThumbsUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

// ข้อมูลฤดูกาล
const seasons = {
  rainy: {
    name: "ฤดูฝน",
    months: [6, 7, 8, 9, 10],
    icon: "🌧️",
    crops: [
      { name: "ข้าวหอมมะลิ", reason: "ได้ผลผลิตดีที่สุด", growthDays: 137 },
      { name: "ข้าวเหนียว", reason: "เหมาะกับความชื้น", growthDays: 130 },
      { name: "ข้าวโพด", reason: "เจริญเติบโตรวดเร็ว", growthDays: 90 },
      { name: "ถั่วเหลือง", reason: "ให้ผลผลิตดี", growthDays: 100 },
    ],
  },
  winter: {
    name: "ฤดูหนาว",
    months: [11, 12, 1, 2],
    icon: "❄️",
    crops: [
      { name: "ผักกาดหอม", reason: "คุณภาพดีเยี่ยม", growthDays: 45 },
      { name: "มะเขือเทศ", reason: "ผลผลิตสูง", growthDays: 75 },
      { name: "แตงกวา", reason: "เติบโตดี", growthDays: 55 },
      { name: "บรอกโคลี", reason: "ชอบอากาศเย็น", growthDays: 65 },
      { name: "กะหล่ำปลี", reason: "คุณภาพดี", growthDays: 70 },
    ],
  },
  summer: {
    name: "ฤดูร้อน",
    months: [3, 4, 5],
    icon: "☀️",
    crops: [
      { name: "มะม่วง", reason: "ราคาสูงในฤดู", growthDays: 150 },
      { name: "ทุเรียน", reason: "ออกผลในช่วงนี้", growthDays: 180 },
      { name: "ส้มโอ", reason: "หวานและฉ่ำน้ำ", growthDays: 120 },
      { name: "ลำไย", reason: "คุณภาพดี", growthDays: 140 },
      { name: "มะละกอ", reason: "เติบโตรวดเร็ว", growthDays: 90 },
    ],
  },
};

// ฟังก์ชันหาฤดูกาลปัจจุบัน
function getCurrentSeason(): keyof typeof seasons {
  const month = new Date().getMonth() + 1;
  if (seasons.rainy.months.includes(month)) return "rainy";
  if (seasons.winter.months.includes(month)) return "winter";
  return "summer";
}

// ฟังก์ชันคำนวณระดับราคา
function getPriceLevel(
  currentPrice: number,
  avgPrice: number
): "low" | "medium" | "high" {
  if (currentPrice < avgPrice * 0.85) return "low";
  if (currentPrice > avgPrice * 1.15) return "high";
  return "medium";
}

export function Recommendations() {
  const { priceHistory, schedules } = useData();
  const currentSeason = getCurrentSeason();
  const seasonData = seasons[currentSeason];

  // คำนวณข้อมูลราคาสำหรับพืชแต่ละชนิด
  const getPriceInfo = (cropName: string) => {
    const crop = priceHistory[0];
    if (!crop || !(cropName in crop)) return null;

    const prices = priceHistory.map((h) => h[cropName] as number);
    const currentPrice = prices[prices.length - 1];
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const priceLevel = getPriceLevel(currentPrice, avgPrice);

    return { currentPrice, avgPrice, priceLevel };
  };

  // แนะนำพืชตามฤดูกาลปัจจุบัน
  const seasonalRecommendations = seasonData.crops.map((crop) => {
    const priceInfo = getPriceInfo(crop.name);
    return {
      ...crop,
      priceInfo,
      season: seasonData.name,
    };
  });

  // แนะนำพืชที่มีราคาดี (high price)
  const highPriceCrops = Object.keys(priceHistory[0] || {})
    .filter((key) => key !== "date")
    .map((cropName) => {
      const priceInfo = getPriceInfo(cropName);
      return { cropName, priceInfo };
    })
    .filter((item) => item.priceInfo?.priceLevel === "high")
    .sort((a, b) => (b.priceInfo?.currentPrice || 0) - (a.priceInfo?.currentPrice || 0));

  // แนะนำพืชที่เหมาะสมทั้งฤดูกาลและราคา
  const bestRecommendations = seasonalRecommendations
    .filter((crop) => crop.priceInfo?.priceLevel === "high" || crop.priceInfo?.priceLevel === "medium")
    .slice(0, 3);

  const getPriceLevelBadge = (level: "low" | "medium" | "high") => {
    const variants = {
      low: { variant: "outline" as const, text: "ราคาต่ำ", color: "text-blue-600" },
      medium: { variant: "secondary" as const, text: "ราคาปานกลาง", color: "text-gray-600" },
      high: { variant: "default" as const, text: "ราคาสูง", color: "text-green-600" },
    };
    return variants[level];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">คำแนะนำการปลูกพืช</h2>
        <p className="text-gray-600 mt-1">
          แนะนำพืชที่เหมาะสมตามฤดูกาลและช่วงราคาที่ดี
        </p>
      </div>

      {/* Current Season Info */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{seasonData.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ขณะนี้เป็น{seasonData.name}
            </h3>
            <p className="text-gray-700">
              เดือนที่เหมาะสม: {seasonData.months.map((m) => {
                const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                return monthNames[m - 1];
              }).join(", ")}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              มีพืช {seasonData.crops.length} ชนิดที่เหมาะสมปลูกในฤดูนี้
            </p>
          </div>
        </div>
      </Card>

      {/* Best Recommendations */}
      {bestRecommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">แนะนำสูงสุด: เหมาะทั้งฤดูกาลและราคา</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bestRecommendations.map((crop, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{crop.name}</h4>
                    <p className="text-xs text-gray-600">ระยะเวลา {crop.growthDays} วัน</p>
                  </div>
                  {crop.priceInfo && (
                    <Badge className="bg-green-600">
                      {getPriceLevelBadge(crop.priceInfo.priceLevel).text}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{crop.reason}</p>
                {crop.priceInfo && (
                  <div className="text-sm">
                    <p className="text-green-700 font-medium">
                      ราคาปัจจุบัน: ฿{crop.priceInfo.currentPrice}/กก.
                    </p>
                    <p className="text-gray-600">
                      ราคาเฉลี่ย: ฿{crop.priceInfo.avgPrice.toFixed(2)}/กก.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs for different recommendations */}
      <Tabs defaultValue="season" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="season">
            <Calendar className="h-4 w-4 mr-2" />
            ตามฤดูกาล
          </TabsTrigger>
          <TabsTrigger value="price">
            <DollarSign className="h-4 w-4 mr-2" />
            ตามราคา
          </TabsTrigger>
        </TabsList>

        {/* Season-based recommendations */}
        <TabsContent value="season">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">
                พืชที่เหมาะสมปลูกใน{seasonData.name}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seasonalRecommendations.map((crop, index) => {
                const badge = crop.priceInfo
                  ? getPriceLevelBadge(crop.priceInfo.priceLevel)
                  : null;

                return (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                        <p className="text-xs text-gray-600">
                          ระยะเวลา {crop.growthDays} วัน
                        </p>
                      </div>
                      {badge && (
                        <Badge variant={badge.variant} className={badge.color}>
                          {badge.text}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{crop.reason}</p>
                    {crop.priceInfo && (
                      <div className="bg-gray-50 rounded p-2 text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">ราคาปัจจุบัน:</span>
                          <span className="font-medium">
                            ฿{crop.priceInfo.currentPrice}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ราคาเฉลี่ย:</span>
                          <span className="font-medium">
                            ฿{crop.priceInfo.avgPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Price-based recommendations */}
        <TabsContent value="price">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">พืชที่มีราคาสูง (คุ้มค่าปลูก)</h3>
            </div>
            {highPriceCrops.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                ไม่พบพืชที่มีราคาสูงในขณะนี้
              </p>
            ) : (
              <div className="space-y-3">
                {highPriceCrops.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {item.cropName}
                        </h4>
                        <Badge className="bg-amber-600">ราคาสูง</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        เหมาะสำหรับการขายในช่วงนี้
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ฿{item.priceInfo?.currentPrice}
                      </p>
                      <p className="text-xs text-gray-600">
                        เฉลี่ย ฿{item.priceInfo?.avgPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        +
                        {(
                          ((item.priceInfo!.currentPrice - item.priceInfo!.avgPrice) /
                            item.priceInfo!.avgPrice) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">เคล็ดลับการเลือกปลูกพืช</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• เลือกพืชที่เหมาะสมกับฤดูกาลเพื่อผลผลิตที่ดี</li>
              <li>• ติดตามแนวโน้มราคาเพื่อวางแผนการขาย</li>
              <li>• ปลูกหลากหลายชนิดเพื่อกระจายความเสี่ยง</li>
              <li>• จดบันทึกข้อมูลการเพาะปลูกเพื่อวิเคราะห์และพัฒนา</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
