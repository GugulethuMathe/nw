import React from "react";
import { Link, useLocation } from "wouter";
import logoPath from "@assets/logo.png";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [location] = useLocation();
  
  // Mock user data - would come from auth context in real app
  const user = {
    name: "John Doe",
    role: "Field Assessor"
  };
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-tachometer-alt", path: "/dashboard" },
    { id: "map", label: "Map View", icon: "fa-map-marked-alt", path: "/map" },
    { id: "sites", label: "Sites & Centers", icon: "fa-building", path: "/sites" },
    { id: "staff", label: "Staff", icon: "fa-users", path: "/staff" },
    { id: "assets", label: "Assets", icon: "fa-clipboard-list", path: "/assets" },
    { id: "programs", label: "Programs", icon: "fa-book", path: "/programs" },
    { id: "reports", label: "Reports", icon: "fa-chart-bar", path: "/reports" }
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && location === "/") return true;
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transition-all duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } z-20 pt-16`}
    >
      <div className="text-center py-4 border-b border-neutral-200">
        <img src={logoPath} alt="North West CET College Logo" className="h-12 mx-auto mb-2" />
      </div>
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
            <i className="fas fa-user"></i>
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
        <Link href="/settings">
          <div className="flex items-center text-neutral-500 hover:text-primary-500 transition-colors cursor-pointer">
            <i className="fas fa-cog w-6"></i>
            <span>Settings</span>
          </div>
        </Link>
        <Link href="/logout">
          <div className="flex items-center text-neutral-500 hover:text-primary-500 transition-colors cursor-pointer mt-3">
            <i className="fas fa-sign-out-alt w-6"></i>
            <span>Logout</span>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
