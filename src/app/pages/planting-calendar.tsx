import { useState } from "react";
import { useData } from "../context/data-context";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Leaf,
  MapPin,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { PlantingSchedule } from "../context/data-context";
import { AddScheduleDialog } from "../components/add-schedule-dialog";
import { EditScheduleDialog } from "../components/edit-schedule-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const seasonInfo = [
  {
    season: "ฤดูฝน",
    months: "มิ.ย. - ต.ค.",
    crops: ["ข้าวหอมมะลิ", "ข้าวเหนียว", "ข้าวโพด", "ถั่วเหลือง"],
    color: "bg-blue-100 text-blue-800",
    icon: "🌧️",
  },
  {
    season: "ฤดูหนาว",
    months: "พ.ย. - ก.พ.",
    crops: ["ผักกาดหอม", "มะเขือเทศ", "แตงกวา", "บรอกโคลี"],
    color: "bg-cyan-100 text-cyan-800",
    icon: "❄️",
  },
  {
    season: "ฤดูร้อน",
    months: "มี.ค. - พ.ค.",
    crops: ["มะม่วง", "ทุเรียน", "ส้มโอ", "ลำไย"],
    color: "bg-orange-100 text-orange-800",
    icon: "☀️",
  },
];

export function PlantingCalendar() {
  const { schedules, deleteSchedule } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PlantingSchedule | null>(
    null
  );
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(
    null
  );
  const [userRole, setUserRole] = useState<"owner" | "employee">("owner");

  const getStatusBadge = (status: PlantingSchedule["status"]) => {
    switch (status) {
      case "planned":
        return <Badge variant="outline">วางแผนแล้ว</Badge>;
      case "planted":
        return <Badge className="bg-green-600">กำลังปลูก</Badge>;
      case "harvested":
        return <Badge variant="secondary">เก็บเกี่ยวแล้ว</Badge>;
    }
  };

  const filterSchedulesByStatus = (status: PlantingSchedule["status"]) => {
    return schedules.filter((s) => s.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ปฏิทินการวางแผนการปลูก
          </h2>
          <p className="text-gray-600 mt-1">
            วางแผนการเพาะปลูกตามฤดูกาลเพื่อผลผลิตที่ดีที่สุด
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มแผนการปลูก
        </Button>
      </div>

      {/* Season Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {seasonInfo.map((season) => (
          <Card key={season.season} className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{season.icon}</span>
              <div>
                <h3 className="font-semibold text-lg">{season.season}</h3>
                <p className="text-sm text-gray-600">{season.months}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">พืชที่เหมาะสม:</p>
              <div className="flex flex-wrap gap-2">
                {season.crops.map((crop) => (
                  <span
                    key={crop}
                    className={`text-xs px-2 py-1 rounded ${season.color}`}
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Planting Schedule Table */}
      <Card className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">ทั้งหมด ({schedules.length})</TabsTrigger>
            <TabsTrigger value="planned">
              วางแผนแล้ว ({filterSchedulesByStatus("planned").length})
            </TabsTrigger>
            <TabsTrigger value="planted">
              กำลังปลูก ({filterSchedulesByStatus("planted").length})
            </TabsTrigger>
            <TabsTrigger value="harvested">
              เก็บเกี่ยวแล้ว ({filterSchedulesByStatus("harvested").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ScheduleTable
              schedules={schedules}
              getStatusBadge={getStatusBadge}
              onEdit={setEditingSchedule}
              onDelete={setDeletingScheduleId}
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="planned">
            <ScheduleTable
              schedules={filterSchedulesByStatus("planned")}
              getStatusBadge={getStatusBadge}
              onEdit={setEditingSchedule}
              onDelete={setDeletingScheduleId}
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="planted">
            <ScheduleTable
              schedules={filterSchedulesByStatus("planted")}
              getStatusBadge={getStatusBadge}
              onEdit={setEditingSchedule}
              onDelete={setDeletingScheduleId}
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="harvested">
            <ScheduleTable
              schedules={filterSchedulesByStatus("harvested")}
              getStatusBadge={getStatusBadge}
              onEdit={setEditingSchedule}
              onDelete={setDeletingScheduleId}
              userRole={userRole}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Add Dialog */}
      <AddScheduleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Edit Dialog */}
      {editingSchedule && (
        <EditScheduleDialog
          schedule={editingSchedule}
          open={!!editingSchedule}
          onOpenChange={(open) => !open && setEditingSchedule(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingScheduleId}
        onOpenChange={(open) => !open && setDeletingScheduleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบแผนการปลูก</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบแผนการปลูกนี้? การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingScheduleId) {
                  deleteSchedule(deletingScheduleId);
                  setDeletingScheduleId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบแผน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ScheduleTable({
  schedules,
  getStatusBadge,
  onEdit,
  onDelete,
  userRole,
}: {
  schedules: PlantingSchedule[];
  getStatusBadge: (status: PlantingSchedule["status"]) => JSX.Element;
  onEdit: (schedule: PlantingSchedule) => void;
  onDelete: (id: string) => void;
  userRole: "owner" | "employee";
}) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">ไม่มีแผนการปลูก</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อพืช</TableHead>
            <TableHead>หมวดหมู่</TableHead>
            <TableHead>วันที่ปลูก</TableHead>
            <TableHead>วันที่เก็บเกี่ยว</TableHead>
            <TableHead className="text-right">พื้นที่ (ไร่)</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>หมายเหตุ</TableHead>
            <TableHead className="text-center">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  {schedule.cropName}
                </div>
              </TableCell>
              <TableCell>{schedule.category}</TableCell>
              <TableCell>
                {new Date(schedule.plantingDate).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                {new Date(schedule.harvestDate).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">{schedule.area}</TableCell>
              <TableCell>{getStatusBadge(schedule.status)}</TableCell>
              <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                {schedule.notes}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  {userRole === "owner" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  {userRole === "employee" && (
                    <Badge variant="secondary" className="text-xs">
                      อ่านอย่างเดียว
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}