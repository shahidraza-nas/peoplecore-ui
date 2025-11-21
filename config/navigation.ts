import { MessageSquare, User, LayoutDashboard, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Employees", icon: Users, path: "/employees" },
  { name: "Chat", icon: MessageSquare, path: "/chat" },
  { name: "Profile", icon: User, path: "/profile" },
];

export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/about",
  "/features",
  "/pricing",
  "/faq",
  "/terms",
  "/privacy",
];

export const authRoutes = [
  "/dashboard",
  "/employees",
  "/chat",
  "/profile",
];
