import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  LogOut, 
  Folder
} from "lucide-react";
import clsx from "clsx";
import { ThemeToggle } from "@/components/ThemeToggle";

export const DashboardLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/" },
    { name: "Events", icon: Calendar, path: "/events" },
    { name: "Team Members", icon: Users, path: "/team" },
    { name: "Blogs", icon: FileText, path: "/blogs" },
    { name: "Projects", icon: Folder, path: "/projects" },
  ];

  return (
    <div className="min-h-screen flex text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-glass border-r border-glass-border backdrop-blur-xl flex flex-col fixed inset-y-0 z-50">
        <div className="h-20 flex justify-between items-center px-6 border-b border-glass-border">
          <div className="flex flex-col justify-center">
            <span className="font-bold text-2xl tracking-tight text-foreground leading-tight">IETECH</span>
            <span className="font-medium text-[11px] tracking-widest text-primary uppercase mt-0.5">Admin Panel</span>
          </div>
          <ThemeToggle />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-glass-border flex space-x-2">
          <button 
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center space-x-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen relative overflow-y-auto w-full">
        {/* Subtle mesh background element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
        
        <Outlet />
      </main>
    </div>
  );
};
