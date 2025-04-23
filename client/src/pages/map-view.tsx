import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const MapView: React.FC = () => {
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
    district: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // List of districts in North West Province
  const districts = [
    "Bojanala",
    "Dr Kenneth Kaunda",
    "Dr Ruth Segomotsi Mompati",
    "Ngaka Modiri Molema"
  ];

  // Initialize Leaflet map when component mounts
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    // Load Leaflet CSS
    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(leafletCss);

    // Load Leaflet JS and MarkerCluster
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      // Load MarkerCluster plugin after Leaflet
      const clusterScript = document.createElement("script");
      clusterScript.src = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
      
      // Also load the CSS for MarkerCluster
      const clusterCss = document.createElement("link");
      clusterCss.rel = "stylesheet";
      clusterCss.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
      document.head.appendChild(clusterCss);
      
      const clusterDefaultCss = document.createElement("link");
      clusterDefaultCss.rel = "stylesheet";
      clusterDefaultCss.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
      document.head.appendChild(clusterDefaultCss);
      
      clusterScript.onload = () => {
        // Initialize map after all scripts are loaded
        if (!mapRef.current) return;

        // Center on South Africa - approximately centered on North West Province
        const map = L.map(mapRef.current).setView([-26.77, 25.09], 7);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add scale control
        L.control.scale().addTo(map);

        setMapInstance(map);
        setMapLoaded(true);
      };
      
      document.head.appendChild(clusterScript);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up map when component unmounts
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapRef, mapLoaded, mapInstance]);

  // Update markers when sites data changes or filters change
  useEffect(() => {
    if (!mapLoaded || !mapInstance || !sites) return;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker) marker.remove();
    });

    // Filter sites based on current filters and search term
    const filteredSites = sites.filter(site => {
      const typeMatch = (
        (site.type === "CLC" && filters.clcSites) ||
        (site.type === "Satellite" && filters.satelliteSites) ||
        (site.type === "Operational" && filters.operationalCenters)
      );
      
      const statusMatch = filters.status === "all" || site.operationalStatus.toLowerCase() === filters.status.toLowerCase();
      const districtMatch = filters.district === "all" || site.district === filters.district;
      
      const searchMatch = !searchTerm || 
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.siteId.toLowerCase().includes(searchTerm.toLowerCase());
      
      return typeMatch && statusMatch && districtMatch && searchMatch;
    });

    // Create a marker cluster group
    const markerCluster = L.markerClusterGroup({
      disableClusteringAtZoom: 10,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    // Create new markers for filtered sites
    const newMarkers = filteredSites
      .filter(site => site.gpsLat && site.gpsLng) // Only sites with coordinates
      .map(site => {
        // Choose marker color based on site type
        const markerColor = 
          site.type === "CLC" ? "#1976D2" : 
          site.type === "Satellite" ? "#4CAF50" : 
          "#FF9800";

        // Create marker
        const marker = L.circleMarker([site.gpsLat!, site.gpsLng!], {
          radius: 8,
          fillColor: markerColor,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        // Add popup
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-medium">${site.name}</h3>
            <p class="text-sm">${site.type} - ${site.district}</p>
            <p class="text-sm">Status: ${site.operationalStatus}</p>
            <button class="text-primary-500 text-sm view-site-details" data-site-id="${site.id}">View Details</button>
          </div>
        `);

        // Add event listener to the marker
        marker.on('click', () => {
          setSelectedSite(site);
        });

        return marker;
      });

    // Add all markers to the cluster
    newMarkers.forEach(marker => {
      markerCluster.addLayer(marker);
    });

    // Add the cluster to the map
    mapInstance.addLayer(markerCluster);
    
    // Add a custom event listener for the "View Details" button in popups
    mapInstance.on('popupopen', function(e: any) {
      const viewDetailsBtn = document.querySelector('.view-site-details');
      if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', function(this: HTMLElement) {
          const siteId = this.getAttribute('data-site-id');
          if (siteId) {
            const site = sites.find(s => s.id === parseInt(siteId));
            if (site) {
              setSelectedSite(site);
            }
          }
        });
      }
    });

    setMarkers([...newMarkers, markerCluster]);

    // If we have filtered sites with coordinates, fit the map to these bounds
    if (newMarkers.length > 0) {
      const group = L.featureGroup(newMarkers);
      mapInstance.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [sites, mapLoaded, mapInstance, filters, searchTerm]);

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already reactive with the useEffect above
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Map View</h1>
        <p className="text-neutral-500">
          Geographic distribution of all college sites
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Map Filters</CardTitle>
              <CardDescription>Refine your map view</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Search</label>
                  <div className="flex">
                    <Input 
                      placeholder="Site name or ID" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit" variant="ghost" className="ml-2">
                      <i className="fas fa-search"></i>
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Site Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="clcSites" 
                        checked={filters.clcSites}
                        onCheckedChange={(checked) => handleFilterChange('clcSites', checked)}
                      />
                      <label htmlFor="clcSites" className="text-sm text-neutral-700 flex items-center">
                        <span className="w-3 h-3 bg-primary-500 rounded-full inline-block mr-2"></span>
                        CLC Sites
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="satelliteSites" 
                        checked={filters.satelliteSites}
                        onCheckedChange={(checked) => handleFilterChange('satelliteSites', checked)}
                      />
                      <label htmlFor="satelliteSites" className="text-sm text-neutral-700 flex items-center">
                        <span className="w-3 h-3 bg-success-light rounded-full inline-block mr-2"></span>
                        Satellite Sites
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="operationalCenters" 
                        checked={filters.operationalCenters}
                        onCheckedChange={(checked) => handleFilterChange('operationalCenters', checked)}
                      />
                      <label htmlFor="operationalCenters" className="text-sm text-neutral-700 flex items-center">
                        <span className="w-3 h-3 bg-warning-light rounded-full inline-block mr-2"></span>
                        Operational Centers
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Status</h3>
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
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">District</h3>
                  <Select 
                    value={filters.district}
                    onValueChange={(value) => handleFilterChange('district', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setFilters({
                        clcSites: true,
                        satelliteSites: true,
                        operationalCenters: true,
                        status: "all",
                        district: "all"
                      });
                      setSearchTerm("");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Map Container */}
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 h-[calc(100vh-200px)]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center bg-neutral-100">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="relative h-full">
                  <div ref={mapRef} className="w-full h-full"></div>
                  
                  {/* Site Detail Overlay - shown when a site is selected */}
                  {selectedSite && (
                    <div className="absolute top-4 right-4 w-80 bg-white rounded-md shadow-md z-10 overflow-hidden">
                      <div className="p-4 bg-primary-50 border-b border-primary-100 flex justify-between items-center">
                        <h3 className="font-medium text-neutral-800">{selectedSite.name}</h3>
                        <button 
                          className="text-neutral-500 hover:text-neutral-800"
                          onClick={() => setSelectedSite(null)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center mr-2">
                            <i className={`fas ${selectedSite.type === "CLC" ? "fa-building" : selectedSite.type === "Satellite" ? "fa-satellite" : "fa-broadcast-tower"}`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{selectedSite.type} Site</p>
                            <p className="text-xs text-neutral-500">{selectedSite.siteId}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex">
                            <span className="text-neutral-500 w-24">District:</span>
                            <span className="text-neutral-800">{selectedSite.district}</span>
                          </div>
                          <div className="flex">
                            <span className="text-neutral-500 w-24">Address:</span>
                            <span className="text-neutral-800">{selectedSite.physicalAddress || "Not recorded"}</span>
                          </div>
                          <div className="flex">
                            <span className="text-neutral-500 w-24">Status:</span>
                            <span className="text-neutral-800">{selectedSite.operationalStatus}</span>
                          </div>
                          <div className="flex">
                            <span className="text-neutral-500 w-24">Assessment:</span>
                            <span className="text-neutral-800">{selectedSite.assessmentStatus}</span>
                          </div>
                          <div className="flex">
                            <span className="text-neutral-500 w-24">Coordinates:</span>
                            <span className="text-neutral-800">
                              {selectedSite.gpsLat}, {selectedSite.gpsLng}
                            </span>
                          </div>
                        </div>
                        
                        <Link href={`/sites/${selectedSite.id}`}>
                          <Button className="w-full">
                            View Full Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapView;
