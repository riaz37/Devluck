// src/app/Student/settings/page.tsx
"use client";

import { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Student/DashboardLayout";

import { useAuth } from "@/hooks/useAuth"; 
import { useStudentSettingsHandler } from "@/hooks/studentapihandler/useStudentSettingsHandler";
import { useStudentProfileHandler } from "@/hooks/studentapihandler/useStudentProfileHandler";
import { useStudentNotificationHandler } from "@/hooks/studentapihandler/useStudentNotificationHandler";
import { AlertTriangle, Bell, Eye, EyeOff, Laptop, Moon, Settings, Shield, Sun } from "lucide-react";
import { motion } from "framer-motion";
import DecryptedText from "@/components/ui/DecryptedText";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IconTabs } from "@/components/common/TabItem";
import { Badge } from "@/components/ui/badge";
import AddressModal from "@/components/Student/Modal/AddressModal";

 
export default function SettingsPage() {
 const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingAddress, setEditingAddress] = useState<any>(null);
   const [showPassword, setShowPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [deletingProfile, setDeletingProfile] = useState(false);
   const { logout } = useAuth();
   const router = useRouter();

   // Settings hook
   const {
     settings,
     getSettings,
     updateSettings,
     changePasswordLoading,
     changePasswordError,
     changePassword,
     addresses,
     addressLoading,
     getAddresses,
     createAddress,
     updateAddress,
     deleteAddress
   } = useStudentSettingsHandler();

   // Profile hook for delete
   const { deleteProfile } = useStudentProfileHandler();
   const { notifications, listNotifications } = useStudentNotificationHandler();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
    // Theme state from API
    const { theme, setTheme } = useTheme();
 
   // Password state
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showPasswordSection, setShowPasswordSection] = useState(false);
 
   const handleLogout = async () => {
     try {
       await logout();
       router.push("/auth");
     } catch (error) {
       console.error("Logout failed:", error);
     }
   };
 
   // Load settings and addresses on component mount
   useEffect(() => {
     getSettings().catch(console.error);
     getAddresses().catch(console.error);
     listNotifications(1, 10).catch(console.error);
   }, []);

    // Handle theme update
    const handleThemeUpdate = async () => {
      try {
        await updateSettings({ theme });
          toast.success("Theme updated successfully!");
      } catch {
        toast.error("Failed to update theme");
      }
    };

 
    // Handle password change
    const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();

      if (newPassword !== confirmPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }

      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      try {
        await changePassword(currentPassword, newPassword, confirmPassword);
        toast.success("Password changed successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      } catch (error) {
        console.error("Failed to change password:", error);
        toast.success("Failed to change password. Please check your current password.");
      }
    };
 
    const tabs = [
          {
            name: "General",
            value: "general",
            icon: Settings,
            content: (
              <div className="flex flex-col gap-6">

                {/* ───── ROW 1: PROFILE + THEME ───── */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">

                  {/* PROFILE CARD */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile</CardTitle>
                    </CardHeader>

                    <CardContent className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Delete your profile permanently
                      </p>

                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Profile
                      </Button>
                    </CardContent>
                  </Card>

                  {/* THEME CARD */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Theme</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-wrap gap-3">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={() => setTheme("light")}
                        className="gap-2"
                      >
                        <Sun className="w-4 h-4" />
                        Light
                      </Button>

                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={() => setTheme("dark")}
                        className="gap-2"
                      >
                        <Moon className="w-4 h-4" />
                        Dark
                      </Button>

                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        onClick={() => setTheme("system")}
                        className="gap-2"
                      >
                        <Laptop className="w-4 h-4" />
                        System
                      </Button>
                    </CardContent>
                  </Card>

                </div>

            {/* ───── ADDRESS SECTION ───── */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Address</CardTitle>

                <Button
                  size="sm"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsModalOpen(true);
                  }}
                >
                  Add Address
                </Button>
              </CardHeader>

              <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">

                {addressLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading addresses...
                  </p>
                ) : addresses.length > 0 ? (
                  addresses.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-4 hover:bg-muted/40 transition"
                    >

                      {/* LEFT CONTENT */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({item.tag})
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {item.address}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {item.phoneNumber}
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0">

                        {/* EDIT */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAddress(item);
                            setIsModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>

                        {/* DELETE */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(item.id)}
                        >
                          Delete
                        </Button>

                      </div>

                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No addresses available.
                  </p>
                )}

              </CardContent>
            </Card>

              </div>
            )
          },

          {
            name: "Security",
            value: "security",
            icon: Shield,
            content: (
      <div className="flex flex-col gap-6 max-w-xl">

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handlePasswordChange}
              className="flex flex-col gap-4"
            >

              {/* Current Password */}
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff  size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewPassword ? <Eye size={18} /> : <EyeOff  size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff  size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {changePasswordError && (
                <p className="text-sm text-destructive">
                  {changePasswordError}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={changePasswordLoading}
                className="w-fit"
              >
                {changePasswordLoading ? "Changing..." : "Change Password"}
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    ),
          },
        ];



 
  return (
    <DashboardLayout>
      <div
        className="py-6 min-h-[800px]"
        style={{
          transform: "scale(0.96)",
          transformOrigin: "top center",
        }}
      >
{/* ✅ CONTENT CONTAINER */}
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
  
          {/* LEFT */}
          <div>
            <motion.h1
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DecryptedText
                text="Settings"
                speed={40}
                maxIterations={20}
                className="revealed"
                parentClassName="inline-block"
              />
            </motion.h1>

            <p className="text-muted-foreground mt-1">
              Manage your account preferences and system settings.
            </p>
          </div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <Button
              size="lg"
              onClick={handleLogout}
              className={cn(
                "rounded-[var(--radius)] px-6 font-bold transition-all duration-300",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98]",
                "shadow-[0_8px_20px_-4px_oklch(var(--primary)/0.2)]",
                "border border-primary/10"
              )}
            >
              Log Out
            </Button>
          </motion.div>
        </header>

                 <div>
                  <IconTabs tabs={tabs} defaultValue="general" />
              </div>

       

      </div>
      </div>
    <AddressModal
      isOpen={isModalOpen}
      Address={editingAddress}
      onClose={() => {
        setIsModalOpen(false);
        setEditingAddress(null);
      }}
      onSave={async (data) => {
        try {
          if (editingAddress?.id) {
            await updateAddress(editingAddress.id, data);
            toast.success("Address updated successfully");
          } else {
            await createAddress(data);
            toast.success("Address created successfully");
          }
          await getAddresses();
          setIsModalOpen(false);
          setEditingAddress(null);
        } catch (error) {
          console.error("Failed to save address:", error);
          toast.error("Failed to save address. Please try again.");
        }
      }}
    />

    <ConfirmDeleteDialog
      isOpen={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      isDeleting={deletingProfile}
      title="Delete Account"
      description="Are you sure you want to permanently delete your account? This will delete all your data including profile, opportunities, contracts, and payments. This action cannot be undone."
      onConfirm={async () => {
        setDeletingProfile(true);

        try {
          await deleteProfile();
          await logout();
          router.push("/auth");
        } catch (error) {
          console.error("Failed to delete profile:", error);
          toast.error("Failed to delete profile. Please try again.");
        } finally {
          setDeletingProfile(false);
          setShowDeleteConfirm(false); // ✅ important (close dialog)
        }
      }}
    />

    <ConfirmDeleteDialog
      isOpen={!!deleteId}
      onOpenChange={(open) => {
        if (!open) setDeleteId(null);
      }}
      title="Delete Address"
      description={
        "This action will permanently delete this address from your account.\n\n" +
        "Once deleted, you will no longer be able to use this address \n\n" +

        "This action cannot be undone."
      }
      isDeleting={isDeleting}
      onConfirm={async () => {
        if (!deleteId) return;

        try {
          setIsDeleting(true);

          await deleteAddress(deleteId);
          await getAddresses();

          toast.success("Address deleted successfully");

          setDeleteId(null);
        } catch (error) {
          console.error("Failed to delete address:", error);

          toast.error("Failed to delete address. Please try again.");
        } finally {
          setIsDeleting(false);
        }
      }}
    />

    </DashboardLayout>
    );
}