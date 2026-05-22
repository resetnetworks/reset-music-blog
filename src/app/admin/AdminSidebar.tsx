"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Plus, LogOut, LayoutDashboard, Tags as TagsIcon, Users, Hash } from "lucide-react";
import { logoutAction } from "./actions";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Articles", href: "/admin/articles", icon: FileText },
  { label: "New Article", href: "/admin/articles/new", icon: Plus },
  { label: "Categories", href: "/admin/categories", icon: TagsIcon },
  { label: "Tags", href: "/admin/tags", icon: Hash },
  { label: "Authors", href: "/admin/authors", icon: Users },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border min-h-screen sticky top-0 bg-background z-10">
      <div className="p-4 border-b border-border">
        <Link href="/" className="text-sm font-semibold">
          Reset Music
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || ""}
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}
            <span className="text-xs font-medium truncate max-w-[120px]">
              {user?.name || "Admin"}
            </span>
          </div>
          <button
            onClick={() => logoutAction()}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
