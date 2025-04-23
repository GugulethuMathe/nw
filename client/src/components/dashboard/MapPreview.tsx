import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Site } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MapPreview: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    clcSites: true,
    satelliteSites: true,
    operationalCenters: true,
    status: "all",
  });

  // Initialize Leaflet map when component mounts
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    // Load Leaflet CSS
    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(leafletCss);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      // Initialize map after Leaflet is loaded
      if (!mapRef.current) return;

      // Center on South Africa
      const map = L.map(mapRef.current).setView([-29.0, 25.0], 6);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      setMapInstance(map);
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up map when component unmounts
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapRef, mapLoaded, mapInstance]);

  // Update markers when sites data changes
  useEffect(() => {
    if (!mapLoaded || !mapInstance || !sites) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());

    // Filter sites based on current filters
    const filteredSites = sites.filter(site => {
      const typeMatch = (
        (site.type === "CLC" && filters.clcSites) ||
        (site.type === "Satellite" && filters.satelliteSites) ||
        (site.type === "Operational" && filters.operationalCenters)
      );
      
      const statusMatch = filters.status === "all" || site.operationalStatus.toLowerCase() === filters.status;
      
      return typeMatch && statusMatch;
    });

    // Create new markers for filtered sites
    const newMarkers = filteredSites.map(site => {
      if (!site.gpsLat || !site.gpsLng) return null;

      // Choose marker color based on site type
      const markerColor = 
        site.type === "CLC" ? "blue" : 
        site.type === "Satellite" ? "green" : 
        "orange";

      // Create marker
      const marker = L.marker([site.gpsLat, site.gpsLng], {
        icon: L.divIcon({
          className: `bg-${markerColor}-500 w-4 h-4 rounded-full border-2 border-white`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
      }).addTo(mapInstance);

      // Add popup
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-medium">${site.name}</h3>
          <p class="text-sm">${site.type} - ${site.district}</p>
          <p class="text-sm">Status: ${site.operationalStatus}</p>
          <a href="/sites/${site.id}" class="text-primary-500 text-sm">View Details</a>
        </div>
      `);

      return marker;
    }).filter(Boolean);

    setMarkers(newMarkers as any[]);
  }, [sites, mapLoaded, mapInstance, filters]);

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center pb-2">
        <div>
          <CardTitle>Site Locations</CardTitle>
          <CardDescription>Geographic distribution of centers</CardDescription>
        </div>
        <Link href="/map">
          <a className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center">
            View Full Map <i className="fas fa-arrow-right ml-1"></i>
          </a>
        </Link>
      </CardHeader>
      <CardContent className="relative" style={{ height: "400px" }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div ref={mapRef} className="w-full h-full bg-neutral-100"></div>
            
            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 bg-white rounded-md shadow-md z-10">
              <div className="p-3 border-b border-neutral-200">
                <h4 className="text-sm font-medium text-neutral-700">Map Filters</h4>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="clcSites" 
                      checked={filters.clcSites}
                      onCheckedChange={(checked) => handleFilterChange('clcSites', checked)}
                    />
                    <label htmlFor="clcSites" className="text-sm text-neutral-700">
                      CLC Sites
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="satelliteSites" 
                      checked={filters.satelliteSites}
                      onCheckedChange={(checked) => handleFilterChange('satelliteSites', checked)}
                    />
                    <label htmlFor="satelliteSites" className="text-sm text-neutral-700">
                      Satellite Sites
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="operationalCenters" 
                      checked={filters.operationalCenters}
                      onCheckedChange={(checked) => handleFilterChange('operationalCenters', checked)}
                    />
                    <label htmlFor="operationalCenters" className="text-sm text-neutral-700">
                      Operational Centers
                    </label>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <label className="text-sm text-neutral-700 block mb-1">Status</label>
                  <Select 
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                      <SelectItem value="planned">Planned Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MapPreview;
