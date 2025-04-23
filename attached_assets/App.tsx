import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import Sidebar from "@/components/layout/Sidebar";
import OfflineStatusBar from "@/components/layout/OfflineStatusBar";
import MapPage from "@/pages/MapPage";
import DashboardPage from "@/pages/DashboardPage";
import SitesPage from "@/pages/SitesPage";
import StaffPage from "@/pages/StaffPage";
import AssetsPage from "@/pages/AssetsPage";
import ProgramsPage from "@/pages/ProgramsPage";
import ReportsPage from "@/pages/ReportsPage";

function Router() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const mainContentClass = `pt-16 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : ""}`;

  return (
    <div className="min-h-screen bg-neutral-100">
      <AppHeader onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main className={mainContentClass} id="mainContent">
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/map" component={MapPage} />
          <Route path="/sites" component={SitesPage} />
          <Route path="/staff" component={StaffPage} />
          <Route path="/assets" component={AssetsPage} />
          <Route path="/programs" component={ProgramsPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <OfflineStatusBar />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
