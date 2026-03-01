import { Package, AlertTriangle, Layers, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import type { Product } from "../App";

interface StatsCardsProps {
  products: Product[];
  lowStockProducts: Product[];
}

export function StatsCards({ products, lowStockProducts }: StatsCardsProps) {
  const categories = new Set(products.map((p) => p.category)).size;

  const stats = [
    {
      title: "จำนวนสินค้าทั้งหมด",
      value: products.length,
      icon: Package,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "สินค้าใกล้หมด",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "หมวดหมู่",
      value: categories,
      icon: Layers,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}