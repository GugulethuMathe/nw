import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterState {
  siteTypes: {
    CLC: boolean;
    Satellite: boolean;
    Operational: boolean;
  };
  district: string;
  assessmentStatus: {
    ToVisit: boolean;
    Visited: boolean;
    DataVerified: boolean;
  };
  operationalStatus: {
    Active: boolean;
    Inactive: boolean;
    Planned: boolean;
  };
}

const MapFilters: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    siteTypes: {
      CLC: true,
      Satellite: true,
      Operational: true
    },
    district: "",
    assessmentStatus: {
      ToVisit: true,
      Visited: true,
      DataVerified: true
    },
    operationalStatus: {
      Active: true,
      Inactive: true,
      Planned: true
    }
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSiteTypeChange = (type: keyof typeof filters.siteTypes) => {
    setFilters({
      ...filters,
      siteTypes: {
        ...filters.siteTypes,
        [type]: !filters.siteTypes[type]
      }
    });
  };
  
  const handleDistrictChange = (value: string) => {
    setFilters({
      ...filters,
      district: value
    });
  };
  
  const handleAssessmentStatusChange = (status: keyof typeof filters.assessmentStatus) => {
    setFilters({
      ...filters,
      assessmentStatus: {
        ...filters.assessmentStatus,
        [status]: !filters.assessmentStatus[status]
      }
    });
  };
  
  const handleOperationalStatusChange = (status: keyof typeof filters.operationalStatus) => {
    setFilters({
      ...filters,
      operationalStatus: {
        ...filters.operationalStatus,
        [status]: !filters.operationalStatus[status]
      }
    });
  };
  
  const handleApplyFilters = () => {
    // Would trigger a query with the current filters
    console.log("Applying filters:", filters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      siteTypes: {
        CLC: true,
        Satellite: true,
        Operational: true
      },
      district: "",
      assessmentStatus: {
        ToVisit: true,
        Visited: true,
        DataVerified: true
      },
      operationalStatus: {
        Active: true,
        Inactive: true,
        Planned: true
      }
    });
    setSearchQuery("");
  };

  return (
    <div className="w-full md:w-80 bg-white shadow-md z-10 md:min-h-screen py-4 px-4">
      <h2 className="text-xl font-medium text-neutral-800 mb-4">Map Filters</h2>
      
      {/* Search Field */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <i className="fas fa-search text-neutral-400"></i>
          </span>
          <Input
            type="text"
            placeholder="Search sites..."
            className="w-full pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Site Type Filter */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-neutral-700 mb-2">Site Type</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="clc" 
                checked={filters.siteTypes.CLC} 
                onCheckedChange={() => handleSiteTypeChange("CLC")}
              />
              <label htmlFor="clc" className="text-neutral-700 cursor-pointer">
                CLC (Main Center)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="satellite" 
                checked={filters.siteTypes.Satellite} 
                onCheckedChange={() => handleSiteTypeChange("Satellite")}
              />
              <label htmlFor="satellite" className="text-neutral-700 cursor-pointer">
                Satellite
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="operational" 
                checked={filters.siteTypes.Operational} 
                onCheckedChange={() => handleSiteTypeChange("Operational")}
              />
              <label htmlFor="operational" className="text-neutral-700 cursor-pointer">
                Operational Center
              </label>
            </div>
          </div>
        </div>
        
        {/* District Filter */}
        <div>
          <h3 className="font-medium text-neutral-700 mb-2">District</h3>
          <Select 
            value={filters.district} 
            onValueChange={handleDistrictChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Districts</SelectItem>
              <SelectItem value="bojanala">Bojanala</SelectItem>
              <SelectItem value="drkeneth">Dr Kenneth Kaunda</SelectItem>
              <SelectItem value="drruth">Dr Ruth Segomotsi Mompati</SelectItem>
              <SelectItem value="ngaka">Ngaka Modiri Molema</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Assessment Status Filter */}
        <div>
          <h3 className="font-medium text-neutral-700 mb-2">Assessment Status</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="toVisit" 
                checked={filters.assessmentStatus.ToVisit} 
                onCheckedChange={() => handleAssessmentStatusChange("ToVisit")}
              />
              <label htmlFor="toVisit" className="text-neutral-700 cursor-pointer">
                To Visit
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="visited" 
                checked={filters.assessmentStatus.Visited} 
                onCheckedChange={() => handleAssessmentStatusChange("Visited")}
              />
              <label htmlFor="visited" className="text-neutral-700 cursor-pointer">
                Visited
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dataVerified" 
                checked={filters.assessmentStatus.DataVerified} 
                onCheckedChange={() => handleAssessmentStatusChange("DataVerified")}
              />
              <label htmlFor="dataVerified" className="text-neutral-700 cursor-pointer">
                Data Verified
              </label>
            </div>
          </div>
        </div>
        
        {/* Operational Status Filter */}
        <div>
          <h3 className="font-medium text-neutral-700 mb-2">Operational Status</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="active" 
                checked={filters.operationalStatus.Active} 
                onCheckedChange={() => handleOperationalStatusChange("Active")}
              />
              <label htmlFor="active" className="text-neutral-700 cursor-pointer">
                Active
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inactive" 
                checked={filters.operationalStatus.Inactive} 
                onCheckedChange={() => handleOperationalStatusChange("Inactive")}
              />
              <label htmlFor="inactive" className="text-neutral-700 cursor-pointer">
                Inactive
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="planned" 
                checked={filters.operationalStatus.Planned} 
                onCheckedChange={() => handleOperationalStatusChange("Planned")}
              />
              <label htmlFor="planned" className="text-neutral-700 cursor-pointer">
                Planned
              </label>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3 pt-3">
          <Button 
            variant="default" 
            onClick={handleApplyFilters}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
          >
            Reset
          </Button>
        </div>
      </div>
      
      {/* Filter Count */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <p className="text-sm text-neutral-600">
          <span className="font-medium">282</span> sites match your filters
        </p>
      </div>
    </div>
  );
};

export default MapFilters;
