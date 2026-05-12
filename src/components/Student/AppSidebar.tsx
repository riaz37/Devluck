"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronsUpDown,
  Monitor,
  Sun,
  Moon,
  User,
  CheckCircle,
  ClipboardCheck,
  Trophy,
  Building2,
  GraduationCap,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/useAuth"

const navItems = [
  { name: "Dashboard", path: "/Student/dashboard", icon: LayoutDashboard },
  { name: "Opportunities", path: "/Student/opportunity", icon: Briefcase },
  {
    name: "Applied Opportunities",
    path: "/Student/applied-Opportunity",
    icon: CheckCircle,
  },
  { name: "Profile", path: "/Student/profile", icon: User },
  { name: "Contracts", path: "/Student/contract", icon: FileText },
  { name: "Assessments", path: "/Student/assessments", icon: ClipboardCheck },
  { name: "Top Students", path: "/Student/top-student", icon: Trophy },
  { name: "Top Companies", path: "/Student/top-company", icon: Building2 },
  { name: "Top Universities", path: "/Student/top-university", icon: GraduationCap },
  { name: "Notifications", path: "/Student/notification", icon: Bell },
  { name: "Settings", path: "/Student/settings", icon: Settings },
] as const;

function LogoHeader() {
  return (
    <SidebarHeader>  {/* Optional: subtle border */}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg" className="justify-start">
            <Link href="/Student/dashboard" className="group">
              <img 
                src="/logo.svg" 
                alt="DevLuck Logo" 
                className="mr-3 h-8 w-8 flex-shrink-0 group-data-[state=collapsed]" 
              />
              <div className="flex flex-col text-left min-w-0 group-data-[state=collapsed]:hidden">
                <span className="font-bold text-lg leading-tight">DevLuck</span>
                <span className="text-xs text-muted-foreground font-medium tracking-tight">
                  Student Section
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function NavMain({ items }: { items: typeof navItems }) {
  const pathname = usePathname();
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={pathname === item.path}>
              <Link href={item.path}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function UserFooter() {
    const router = useRouter();
    const { isMobile } = useSidebar();
    const { user, logout } = useAuth()
    const handleLogout = async () => {
        try {
        await logout();
        router.push("/auth");
        } catch (error) {
        console.error("Logout failed:", error);
        }
    };
    const { theme, setTheme } = useTheme();
    const name = user?.email?.split("@")[0] ?? "User"

    const initials = name
        .split(".")
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .slice(0, 2)

    if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.image || undefined} 
                  alt={name} 
                />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
            <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
            >
                {/* PROFILE */}
                <DropdownMenuItem asChild>
                <Link
                    href="/Student/profile"
                    className="flex items-center gap-2 w-full"
                >
                    <User className="h-4 w-4" />
                    Profile
                </Link>
                </DropdownMenuItem>

                {/* SETTINGS */}
                <DropdownMenuItem asChild>
                <Link
                    href="/Student/settings"
                    className="flex items-center gap-2 w-full"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
                </DropdownMenuItem>

                {/* THEME SWITCH (SHADCN STYLE) */}
                <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2 text-sm">
                    {theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                    ) : theme === "light" ? (
                    <Sun className="h-4 w-4" />
                    ) : (
                    <Monitor className="h-4 w-4" />
                    )}
                    Theme
                </div>

                <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                    }
                />
                </div>

                {/* LOGOUT */}
                <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 focus:text-red-500 flex items-center gap-2"
                >
                <LogOut className="h-4 w-4" />
                Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// In AppSidebar.tsx - REMOVE SidebarProvider & SidebarInset, export just Sidebar
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <LogoHeader />
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <UserFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}