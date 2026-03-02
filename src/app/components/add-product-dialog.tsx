import { useState } from "react";
import { useData } from "../context/data-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  "ข้าว",
  "ผักสด",
  "ผลไม้",
  "พืชผล",
  "ถั่ว-งา",
  "เครื่องเทศ",
  "สมุนไพร",
  "อื่นๆ",
];

const units = ["กิโลกรัม", "ลูก", "หวี", "กำ", "ลัง", "ตัน", "ถัง"];

export function AddProductDialog({
  open,
  onOpenChange,
}: AddProductDialogProps) {
  const { addProduct } = useData();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    harvestDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!formData.name.trim()) {
      toast.error("กรุณากรอกชื่อสินค้า");
      return;
    }

    if (!formData.category) {
      toast.error("กรุณาเลือกหมวดหมู่");
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error("กรุณากรอกจำนวนที่มากกว่า 0");
      return;
    }

    if (!formData.unit) {
      toast.error("กรุณาเลือกหน่วย");
      return;
    }

    try {
      await addProduct({
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        minStock: 0,
        harvestDate: formData.harvestDate || undefined,
      });

      // Reset form
      setFormData({
        name: "",
        category: "",
        quantity: "",
        unit: "",
        harvestDate: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อสินค้า *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ระบุชื่อสินค้า"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่ *</Label>
              <Select
                required
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">จำนวน *</Label>
              <Input
                id="quantity"
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">หน่วย *</Label>
              <Select
                required
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value })
                }
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="เลือกหน่วย" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvestDate">วันที่เก็บเกี่ยว</Label>
              <Input
                id="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={(e) =>
                  setFormData({ ...formData, harvestDate: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              เพิ่มสินค้า
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}