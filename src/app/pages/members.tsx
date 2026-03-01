import { useState } from "react";
import { useWorkspace } from "../context/workspace-context";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Users, UserPlus, Copy, CheckCircle, Code, Crown, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export function Members() {
  const { currentWorkspace, inviteToWorkspace } = useWorkspace();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (currentWorkspace) {
      navigator.clipboard.writeText(currentWorkspace.code);
      setCopied(true);
      toast.success("คัดลอกรหัสสำเร็จ!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error("กรุณาใส่อีเมล");
      return;
    }
    if (currentWorkspace) {
      inviteToWorkspace(currentWorkspace.id, inviteEmail);
      toast.success(`ส่งคำเชิญไปยัง ${inviteEmail} แล้ว`);
      setIsInviteDialogOpen(false);
      setInviteEmail("");
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">กรุณาเลือก Workspace ก่อน</p>
      </div>
    );
  }

  const owner = currentWorkspace.members.find((m) => m.role === "owner");
  const employees = currentWorkspace.members.filter((m) => m.role === "employee");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">สมาชิกในทีม</h2>
          <p className="text-gray-600 mt-1">
            จัดการสมาชิกและคำเชิญใน Workspace: {currentWorkspace.name}
          </p>
        </div>
        <Button
          onClick={() => setIsInviteDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          เชิญสมาชิก
        </Button>
      </div>

      {/* Workspace Info Card */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              รหัส Workspace
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              แชร์รหัสนี้กับคนที่คุณต้องการเชิญเข้าร่วม
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border-2 border-green-300">
                <Code className="h-5 w-5 text-green-600" />
                <span className="font-mono text-2xl font-bold text-gray-900">
                  {currentWorkspace.code}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleCopyCode}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    คัดลอก
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">สมาชิกทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentWorkspace.members.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Crown className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Owner</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Employee</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Members Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          รายชื่อสมาชิก
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>เข้าร่วมเมื่อ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owner && (
                <TableRow className="bg-green-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{owner.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Owner
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(owner.joinedAt), "d MMM yyyy", {
                      locale: th,
                    })}
                  </TableCell>
                </TableRow>
              )}
              {employees.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Employee</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(member.joinedAt), "d MMM yyyy", {
                      locale: th,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เชิญสมาชิกเข้าร่วม</DialogTitle>
            <DialogDescription>
              ส่งคำเชิญไปยังอีเมลของสมาชิกที่ต้องการเพิ่ม
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">อีเมล</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-2">
                💡 หรือแชร์รหัส Workspace
              </p>
              <p className="text-xs text-blue-700">
                คุณสามารถแชร์รหัส{" "}
                <span className="font-mono font-bold">
                  {currentWorkspace.code}
                </span>{" "}
                เพื่อให้สมาชิกเข้าร่วมได้เอง
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setInviteEmail("");
                }}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleInvite}
                className="bg-green-600 hover:bg-green-700"
              >
                ส่งคำเชิญ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
