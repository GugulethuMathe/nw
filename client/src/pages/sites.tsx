import React from "react"; // Removed useState import
import SiteList from "@/components/sites/SiteList";
import { Button } from "@/components/ui/button";
// Removed Sheet imports
import { Card, CardContent } from "@/components/ui/card";
// Removed SiteForm import
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { Link } from "wouter"; // Import Link

const Sites: React.FC = () => {
  // Removed isAddSiteOpen state

  const { data: sites } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });
  
  // Calculate some basic stats for the header
  const totalSites = sites?.length || 0;
  const activeSites = sites?.filter(site => site.operationalStatus === "Active").length || 0;
  const inactiveSites = sites?.filter(site => site.operationalStatus === "Inactive").length || 0;
  const plannedSites = sites?.filter(site => site.operationalStatus === "Planned").length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Sites & Centers</h1>
          <p className="text-neutral-500">
            Manage and view all CLC, satellite, and operational sites
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {/* Changed Button to Link */}
         
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-neutral-800">{totalSites}</span>
            <span className="text-sm text-neutral-500">Total Sites</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-success-light">{activeSites}</span>
            <span className="text-sm text-neutral-500">Active</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-neutral-500">{inactiveSites}</span>
            <span className="text-sm text-neutral-500">Inactive</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-warning-light">{plannedSites}</span>
            <span className="text-sm text-neutral-500">Planned</span>
          </CardContent>
        </Card>
      </div>

      {/* Site List */}
      <SiteList />

      {/* Removed Add Site Sheet */}
    </div>
  );
};

export default Sites;
