import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";

const OperationalStatus: React.FC = () => {
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Operational Status</CardTitle>
          <CardDescription>Current status of all sites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3).fill(null).map((_, index) => (
              <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                <div className="h-24 animate-pulse bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    activeSites: sites?.filter(site => site.operationalStatus === "Active").length || 0,
    inactiveSites: sites?.filter(site => site.operationalStatus === "Inactive").length || 0,
    plannedSites: sites?.filter(site => site.operationalStatus === "Planned").length || 0,
  };

  const totalSites = stats.activeSites + stats.inactiveSites + stats.plannedSites;
  const activePercentage = Math.round((stats.activeSites / totalSites) * 100);
  const inactivePercentage = Math.round((stats.inactiveSites / totalSites) * 100);
  const plannedPercentage = Math.round((stats.plannedSites / totalSites) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Status</CardTitle>
        <CardDescription>Current status of all sites</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-neutral-700">Active Sites</h3>
              <span className="px-2 py-1 bg-success-light text-white text-xs rounded-full">
                {activePercentage}%
              </span>
            </div>
            <p className="text-3xl font-bold text-neutral-800">{stats.activeSites}</p>
            <p className="text-sm text-neutral-500 mt-1">Currently operational</p>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-neutral-700">Inactive Sites</h3>
              <span className="px-2 py-1 bg-neutral-500 text-white text-xs rounded-full">
                {inactivePercentage}%
              </span>
            </div>
            <p className="text-3xl font-bold text-neutral-800">{stats.inactiveSites}</p>
            <p className="text-sm text-neutral-500 mt-1">Currently non-operational</p>
          </div>
          
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-neutral-700">Planned Sites</h3>
              <span className="px-2 py-1 bg-warning-light text-white text-xs rounded-full">
                {plannedPercentage}%
              </span>
            </div>
            <p className="text-3xl font-bold text-neutral-800">{stats.plannedSites}</p>
            <p className="text-sm text-neutral-500 mt-1">Future implementation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationalStatus;
