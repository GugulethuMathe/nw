import React from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import SiteTypeChart from "@/components/dashboard/SiteTypeChart";
import SiteDistrictChart from "@/components/dashboard/SiteDistrictChart";
import OperationalStatus from "@/components/dashboard/OperationalStatus";
import RecentActivity from "@/components/dashboard/RecentActivity";
import MapPreview from "@/components/dashboard/MapPreview";

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Dashboard</h1>
        <p className="text-neutral-500">
          Overview of the college baseline assessment project progress
        </p>
      </div>

      {/* Status Cards */}
      <div className="mb-8">
        <DashboardStats />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SiteTypeChart />
        <SiteDistrictChart />
      </div>

      {/* Map Preview */}
      <div className="mb-8">
        <MapPreview />
      </div>

      {/* Operational Status */}
      <div className="mb-8">
        <OperationalStatus />
      </div>

      {/* Recent Activity */}
      <div>
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;
