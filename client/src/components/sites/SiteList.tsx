import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SiteList: React.FC = () => {
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // List of districts in North West Province
  const districts = [
    "Bojanala",
    "Dr Kenneth Kaunda",
    "Dr Ruth Segomotsi Mompati",
    "Ngaka Modiri Molema"
  ];

  // Filter the sites based on search term and filters
  const filteredSites = sites?.filter(site => {
    const matchesSearch = searchTerm === "" || 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.siteId.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = typeFilter === "all" || site.type === typeFilter;
    const matchesDistrict = districtFilter === "all" || site.district === districtFilter;
    const matchesStatus = statusFilter === "all" || site.operationalStatus === statusFilter;
    
    return matchesSearch && matchesType && matchesDistrict && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success-light text-white";
      case "Inactive":
        return "bg-neutral-500 text-white";
      case "Planned":
        return "bg-warning-light text-white";
      default:
        return "bg-neutral-500 text-white";
    }
  };

  const getAssessmentStatusColor = (status: string) => {
    switch (status) {
      case "To Visit":
        return "bg-warning-light bg-opacity-20 text-warning-light";
      case "Visited":
        return "bg-success-light bg-opacity-20 text-success-light";
      case "Data Verified":
        return "bg-primary-100 text-primary-500";
      default:
        return "bg-neutral-200 text-neutral-600";
    }
  };

  if (isLoading) {
    return (
      <div>
        {Array(5).fill(null).map((_, index) => (
          <Card key={index} className="mb-4">
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-neutral-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CLC">CLC</SelectItem>
              <SelectItem value="Satellite">Satellite</SelectItem>
              <SelectItem value="Operational">Operational</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map(district => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">Status:</span>
          <Button 
            variant={statusFilter === "all" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "Active" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("Active")}
            className="text-success-light"
          >
            Active
          </Button>
          <Button 
            variant={statusFilter === "Inactive" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("Inactive")}
          >
            Inactive
          </Button>
          <Button 
            variant={statusFilter === "Planned" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("Planned")}
            className="text-warning-light"
          >
            Planned
          </Button>
        </div>
        
        <div>
          <Link href="/sites/new">
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Add New Site
            </Button>
          </Link>
        </div>
      </div>
      
      {filteredSites && filteredSites.length > 0 ? (
        <div className="space-y-4">
          {filteredSites.map((site) => (
            <Link key={site.id} href={`/sites/${site.id}`}>
              <Card className="cursor-pointer hover:border-primary-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center mr-4 mt-1">
                        <i className={`fas ${site.type === "CLC" ? "fa-building" : site.type === "Satellite" ? "fa-satellite" : "fa-broadcast-tower"}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-neutral-800">{site.name}</h3>
                          <span className="text-sm text-neutral-500 ml-2">({site.siteId})</span>
                        </div>
                        <p className="text-neutral-500">{site.type} - {site.district}</p>
                        <p className="text-sm text-neutral-600 mt-1">
                          {site.physicalAddress ? (
                            <span><i className="fas fa-map-marker-alt mr-1"></i> {site.physicalAddress}</span>
                          ) : (
                            <span className="text-neutral-400 italic">No address recorded</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                      <Badge className={getStatusColor(site.operationalStatus)}>
                        {site.operationalStatus}
                      </Badge>
                      <Badge className={getAssessmentStatusColor(site.assessmentStatus)}>
                        {site.assessmentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="text-5xl text-neutral-300 mb-3">
            <i className="fas fa-building"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-1">No Sites Found</h3>
          <p className="text-neutral-500 mb-4">No sites match your current filters.</p>
          <Button onClick={() => {
            setSearchTerm("");
            setTypeFilter("all");
            setDistrictFilter("all");
            setStatusFilter("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default SiteList;
