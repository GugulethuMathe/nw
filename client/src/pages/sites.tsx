import React, { useState } from "react";
import SiteList from "@/components/sites/SiteList";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import SiteForm from "@/components/sites/SiteForm";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";

const Sites: React.FC = () => {
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  
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
          <Button onClick={() => setIsAddSiteOpen(true)}>
            <i className="fas fa-plus mr-2"></i>
            Add New Site
          </Button>
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

      {/* Add Site Sheet */}
      <Sheet open={isAddSiteOpen} onOpenChange={setIsAddSiteOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>Add New Site</SheetTitle>
            <SheetDescription>
              Enter the details for the new site or center.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <SiteForm onSuccess={() => setIsAddSiteOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Sites;
