import { useState } from "react";
import { useAuth } from "../context/auth-context";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User, Mail, Camera, Save, LogOut, ArrowLeft, Leaf } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/badge";

export function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("กรุณากรอกชื่อ");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({ name, photoUrl });
      toast.success("บันทึกข้อมูลสำเร็จ!");
      setIsEditing(false);
    } catch (error) {
      toast.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/hub")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  โปรไฟล์
                </h1>
                <p className="text-sm text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="p-6 md:col-span-1">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={photoUrl} alt={name} />
                    <AvatarFallback className="text-2xl bg-green-100 text-green-700">
                      {user ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700">
                      <Camera className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
                {user?.loginMethod && (
                  <Badge variant="secondary" className="mb-4">
                    {user.loginMethod === "google" ? "Google Account" : "Email Login"}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Profile Information */}
            <Card className="p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">ข้อมูลส่วนตัว</h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    แก้ไข
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="ชื่อของคุณ"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      className="pl-10 bg-gray-50"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500">ไม่สามารถเปลี่ยนอีเมลได้</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoUrl">URL รูปโปรไฟล์</Label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="photoUrl"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="pl-10"
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    ใส่ URL รูปภาพของคุณ (ไม่บังคับ)
                  </p>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || "");
                        setPhotoUrl(user?.photoUrl || "");
                      }}
                      disabled={isLoading}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Account Statistics */}
            <Card className="p-6 md:col-span-3">
              <h3 className="text-xl font-bold text-gray-900 mb-4">สถิติบัญชี</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">วันที่สร้างบัญชี</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date().toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">สถานะบัญชี</p>
                  <p className="text-lg font-bold text-gray-900">ใช้งานอยู่</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">วิธีการเข้าสู่ระบบ</p>
                  <p className="text-lg font-bold text-gray-900">
                    {user?.loginMethod === "google" ? "Google" : "อีเมล"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Security Section */}
            <Card className="p-6 md:col-span-3 border-orange-200 bg-orange-50">
              <h3 className="text-xl font-bold text-gray-900 mb-2">ความปลอดภัย</h3>
              <p className="text-sm text-gray-600 mb-4">
                ข้อมูลของคุณถูกเก็บไว้ในเครื่องของคุณเท่านั้น
                และจะไม่ถูกส่งไปยังเซิร์ฟเวอร์ใดๆ
              </p>
              <div className="flex items-start gap-2 text-sm text-orange-700">
                <span className="text-lg">⚠️</span>
                <p>
                  หากคุณลบข้อมูลเบราว์เซอร์หรือ localStorage
                  ข้อมูลทั้งหมดจะหายไปอย่างถาวร
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}