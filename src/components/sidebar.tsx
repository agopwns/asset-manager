"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  PieChart,
  ArrowLeftRight,
  Download,
  Settings,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/accounts", label: "계좌 관리", icon: Landmark },
  { href: "/assets", label: "자산 목록", icon: PieChart },
  { href: "/transactions", label: "거래 기록", icon: ArrowLeftRight },
  { href: "/import", label: "데이터 임포트", icon: Download },
  { href: "/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold">Asset Manager</h1>
        <p className="text-xs text-muted-foreground">자산관리 시스템</p>
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        Convex 공유: Snapsheet
      </div>
    </aside>
  );
}
