import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";

const SitesPage: React.FC = () => {
  const { data: sites, isLoading, error } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Sites & Centers</h1>
          <p className="text-neutral-500">
            Manage all sites, CLCs, and operational centers
          </p>
        </div>
        <Button className="mt-4 md:mt-0 bg-primary-500 hover:bg-primary-600">
          <i className="fas fa-plus mr-2"></i> Add New Site
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Sites Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="relative w-full md:w-72 mb-4 md:mb-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-search text-neutral-400"></i>
              </span>
              <Input 
                type="text" 
                placeholder="Search sites..." 
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <i className="fas fa-filter mr-2"></i> Filter
              </Button>
              <Button variant="outline">
                <i className="fas fa-file-export mr-2"></i> Export
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading sites...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-error-light text-5xl mb-4">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <h3 className="text-xl font-medium mb-2">Error Loading Sites</h3>
              <p className="text-neutral-600 mb-4">
                We couldn't load the site data. Please try again later.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <i className="fas fa-redo mr-2"></i> Retry
              </Button>
            </div>
          ) : sites && sites.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Site Name</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">District</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Assessment</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site) => (
                    <tr key={site.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center mr-3">
                            <i className={`fas fa-${site.type === "CLC" ? "building" : site.type === "Satellite" ? "satellite" : "map-marker"}`}></i>
                          </div>
                          <span className="font-medium text-neutral-800">{site.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{site.type}</td>
                      <td className="py-3 px-4 text-neutral-600">{site.district}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs inline-block ${
                          site.operationalStatus === "Active" 
                            ? "bg-success-light text-white" 
                            : site.operationalStatus === "Inactive" 
                              ? "bg-neutral-500 text-white" 
                              : "bg-warning-light text-white"
                        }`}>
                          {site.operationalStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs inline-block ${
                          site.assessmentStatus === "Data Verified" 
                            ? "bg-primary-500 text-white" 
                            : site.assessmentStatus === "Visited" 
                              ? "bg-primary-300 text-white" 
                              : "bg-neutral-300 text-neutral-700"
                        }`}>
                          {site.assessmentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <i className="fas fa-eye text-neutral-600"></i>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <i className="fas fa-edit text-neutral-600"></i>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <i className="fas fa-ellipsis-v text-neutral-600"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-neutral-400 text-5xl mb-4">
                <i className="fas fa-building"></i>
              </div>
              <h3 className="text-xl font-medium mb-2">No Sites Found</h3>
              <p className="text-neutral-600 mb-4">
                There are no sites in the system yet. Get started by adding your first site.
              </p>
              <Button>
                <i className="fas fa-plus mr-2"></i> Add New Site
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SitesPage;
