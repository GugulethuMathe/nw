import React from "react";
import { Link, useLocation, Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import logoPath from "@assets/logo.png";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-tachometer-alt", path: "/dashboard" },
    { id: "map", label: "Map View", icon: "fa-map-marked-alt", path: "/map" },
    { id: "sites", label: "Sites & Centers", icon: "fa-building", path: "/sites" },
    { id: "districts", label: "Districts", icon: "fa-map", path: "/districts" },
    { id: "users", label: "User Management", icon: "fa-user-cog", path: "/users" },
    { id: "reports", label: "Reports", icon: "fa-chart-bar", path: "/reports" },
    { id: "settings", label: "Settings", icon: "fa-cog", path: "/settings" }
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && location === "/") return true;
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transition-all duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } z-20 pt-5`}
    >
      <div className="text-center py-0 border-b border-neutral-200 relative">
        <img src={logoPath} alt="North West CET College Logo" className="h-12 mx-auto mb-2" />
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-500 hover:text-primary-500 transition-colors"
            aria-label="Close sidebar"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        )}
      </div>
      {user ? (
        <>
          <div className="px-4 py-3 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                {user.name ? user.name.split(' ')[0][0].toUpperCase() : <i className="fas fa-user"></i>}
              </div>
              <div>
                <p className="font-medium text-neutral-800">{user.name}</p>
                <p className="text-sm text-neutral-500">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="mt-4">
            <ul>
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.path}>
                    <div 
                      className={`flex items-center px-4 py-3 transition-colors cursor-pointer ${
                        isActive(item.path) 
                          ? "bg-primary-50 text-primary-500 font-medium" 
                          : "text-neutral-700 hover:bg-primary-50 hover:text-primary-500"
                      }`}
                    >
                      <i className={`fas ${item.icon} w-6`}></i>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 w-full border-t border-neutral-200 px-4 py-3">
            <button 
              onClick={handleLogout}
              className="flex items-center text-neutral-500 hover:text-primary-500 transition-colors cursor-pointer w-full text-left"
            >
              <i className="fas fa-sign-out-alt w-6"></i>
              <span>Logout</span>
            </button>
          </div>
        </>
      ) : (
        <div className="px-4 py-3">
          <p className="text-sm text-neutral-500">Please log in to access the system.</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
