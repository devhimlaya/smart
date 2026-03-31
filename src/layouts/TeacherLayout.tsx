import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Settings,
  Bell,
  GraduationCap,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

const navigation = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "My Classes", href: "/teacher/classes", icon: BookOpen },
];

export default function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "TEACHER") {
      navigate("/login");
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/20">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white/95 backdrop-blur-xl border-r border-gray-100/80 transform transition-all duration-300 ease-out lg:translate-x-0 shadow-2xl lg:shadow-xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} />
          
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <span className="font-bold text-xl tracking-tight block">SMART</span>
              <span className="text-[11px] text-emerald-100 font-medium -mt-0.5 block">Academic Portal</span>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-white/15 text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-5">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-teal-50/60 border border-emerald-100/60 shadow-sm">
            <Avatar className="w-12 h-12 border-2 border-white shadow-md ring-2 ring-emerald-100">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold text-lg">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-[15px]">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
              </p>
              <Badge variant="secondary" className="mt-1 bg-emerald-100/80 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 mr-1" />
                Teacher
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 flex-1">
          <p className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Navigation
          </p>
          <div className="space-y-1.5 mt-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== "/teacher" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                      : "hover:bg-gray-100/80"
                  )}
                  style={{
                    color: isActive ? undefined : '#000000'
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
                  )}
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200 relative z-10",
                    isActive 
                      ? "bg-white/20 shadow-sm" 
                      : "bg-gray-100 group-hover:bg-emerald-100"
                  )}
                  style={{
                    color: isActive ? undefined : '#000000'
                  }}>
                    <item.icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="flex-1 relative z-10">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 relative z-10 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Help Section */}
        <div className="p-5 mt-auto">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border border-gray-100 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-100 rounded-full opacity-50 blur-xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <p className="font-semibold text-gray-800 text-sm">Need Assistance?</p>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Contact your school administrator for support and guidance.
              </p>
              <button className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all duration-200 shadow-sm">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[280px]">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 h-[72px] bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm shadow-gray-100/50">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumb with modern style */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-gray-400 font-medium">Teacher Portal</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className="text-gray-800 font-semibold bg-gray-100 px-3 py-1 rounded-lg">
                  {navigation.find(nav => 
                    location.pathname === nav.href || 
                    (nav.href !== "/teacher" && location.pathname.startsWith(nav.href))
                  )?.name || "Dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search placeholder */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-400 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search...</span>
                <kbd className="ml-4 px-1.5 py-0.5 text-xs bg-white rounded border border-gray-200 font-mono">⌘K</kbd>
              </div>

              {/* Notifications */}
              <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors relative group">
                <Bell className="w-5 h-5 group-hover:text-gray-700 transition-colors" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200 mx-1" />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 p-2 pr-4 rounded-xl hover:bg-gray-100 transition-colors">
                  <Avatar className="w-9 h-9 border-2 border-emerald-100">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold">
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">Teacher Account</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl shadow-xl border-gray-100">
                  <div className="px-3 py-3 border-b border-gray-100 mb-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                    </p>
                    <p className="text-xs text-gray-500">{user.username}@school.edu.ph</p>
                  </div>
                  <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5">
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg cursor-pointer py-2.5">
                    <Settings className="w-4 h-4 mr-3 text-gray-500" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="rounded-lg cursor-pointer py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-8 py-5 border-t border-gray-100 bg-white/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>© 2026 SMART Grading System. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Department of Education • Philippines
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
