import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Sparkles, 
  FolderOpen, 
  MessageCircle, 
  LogOut,
  Menu,
  X,
  Globe,
  DollarSign,
  Search,
  Shield,
  ChevronDown,
  BarChart,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigationItems = [
  {
    title: "AI Generator",
    url: createPageUrl("Dashboard"),
    icon: Sparkles,
    description: "Create websites with AI"
  },
  {
    title: "My Projects", 
    url: createPageUrl("Projects"),
    icon: FolderOpen,
    description: "View your website history"
  },
  {
    title: "AI Assistant",
    url: createPageUrl("Assistant"),
    icon: MessageCircle,
    description: "Get help and guidance"
  },
  {
    title: "Pricing",
    url: createPageUrl("Pricing"),
    icon: DollarSign,
    description: "View our plans and features"
  },
  {
    title: "My Templates",
    url: createPageUrl("SavedTemplates"),
    icon: Layers,
    description: "Reusable website templates"
  },
  {
    title: "Usage Dashboard",
    url: createPageUrl("UsageTracking"),
    icon: BarChart,
    description: "Track your plan usage"
  }
];

const adminItems = [
  {
    title: "Admin Panel",
    url: createPageUrl("AdminPanel"),
    icon: Shield,
    description: "Full system control"
  },
  {
    title: "SEO Manager",
    url: createPageUrl("SEOManager"),
    icon: Search,
    description: "Optimize search rankings"
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart,
    description: "Track website performance"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Check if current page is an admin page
    const isAdminPage = adminItems.some(item => location.pathname === item.url);
    if (isAdminPage) {
      setAdminExpanded(true);
    }
  }, [location.pathname]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      // User not logged in
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.reload();
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">WebCraft AI</h1>
                  <p className="text-xs text-gray-300">Website Generator</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`block p-4 rounded-xl transition-all duration-200 group ${
                  location.pathname === item.url
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
                    : 'hover:bg-white/5 hover:border-white/10 border border-transparent'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    location.pathname === item.url
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-white/10 text-gray-300 group-hover:text-white'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${
                      location.pathname === item.url ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {/* Admin Section */}
            {isAdmin && (
              <div className="pt-2">
                <button
                  onClick={() => setAdminExpanded(!adminExpanded)}
                  className="w-full p-4 rounded-xl transition-all duration-200 hover:bg-white/5 border border-white/10 mb-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white">Admin Panel</p>
                        <p className="text-xs text-gray-400">Advanced tools</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${adminExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {adminExpanded && (
                  <div className="space-y-1 ml-4 pl-4 border-l-2 border-white/10">
                    {adminItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        className={`block p-3 rounded-lg transition-all duration-200 ${
                          location.pathname === item.url
                            ? 'bg-orange-500/20 border border-orange-500/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${
                            location.pathname === item.url ? 'text-orange-400' : 'text-gray-400'
                          }`} />
                          <div>
                            <p className={`text-sm font-medium ${
                              location.pathname === item.url ? 'text-white' : 'text-gray-300'
                            }`}>
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.full_name || 'User'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => base44.auth.redirectToLogin()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-white" />
              <h1 className="font-bold text-white">WebCraft AI</h1>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}