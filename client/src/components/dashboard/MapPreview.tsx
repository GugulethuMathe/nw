import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Site } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Add Leaflet type declaration
declare global {
  interface Window {
    L: any;
  }
}

// Add custom CSS for map markers
const addCustomMarkerStyles = () => {
  if (typeof document === 'undefined') return;
  
  // Check if styles already exist
  if (document.getElementById('custom-marker-styles-preview')) return;
  
  const styleTag = document.createElement('style');
  styleTag.id = 'custom-marker-styles-preview';
  styleTag.innerHTML = `
    .custom-marker-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      width: 22px !important;
      height: 22px !important;
      margin-left: -11px !important;
      margin-top: -11px !important;
    }
    
    .bg-primary-500 {
      background-color: #1976D2;
    }
    
    .bg-success-light {
      background-color: #4CAF50;
    }
    
    .bg-warning-light {
      background-color: #FF9800;
    }
    
    .custom-marker-icon i {
      font-size: 12px;
    }
  `;
  
  document.head.appendChild(styleTag);
};

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
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Initialize Leaflet map when component mounts
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;
    
    // Add custom marker styles
    addCustomMarkerStyles();

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
        if (!mapRef.current || !window.L) return;

        // Center on North West Province
        const map = window.L.map(mapRef.current).setView([-26.77, 25.09], 7);

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add scale control
        window.L.control.scale().addTo(map);

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

  // Update markers when sites data changes
  useEffect(() => {
    if (!mapLoaded || !mapInstance || !sites) return;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker) marker.remove();
    });

    // Filter sites based on current filters
    const filteredSites = sites.filter(site => {
      const typeMatch = (
        (site.type === "CLC" && filters.clcSites) ||
        (site.type === "Satellite" && filters.satelliteSites) ||
        (site.type === "Operational" && filters.operationalCenters)
      );
      
      const statusMatch = filters.status === "all" || site.operationalStatus.toLowerCase() === filters.status.toLowerCase();
      
      return typeMatch && statusMatch;
    });

    // Create a marker cluster group
    const markerCluster = window.L.markerClusterGroup({
      disableClusteringAtZoom: 10,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    // Create new markers for filtered sites
    const newMarkers = filteredSites
      .filter(site => site.gpsLat && site.gpsLng) // Only sites with coordinates
      .map(site => {
        // Choose marker color and icon based on site type
        const iconHtml = `
          <div class="flex items-center justify-center w-full h-full">
            <i class="fas ${
              site.type === "CLC" ? "fa-building" :
              site.type === "Satellite" ? "fa-satellite" :
              "fa-broadcast-tower"
            } text-white"></i>
          </div>
        `;
        
        const customIcon = window.L.divIcon({
          className: `custom-marker-icon bg-${
            site.type === "CLC" ? "primary-500" :
            site.type === "Satellite" ? "success-light" :
            "warning-light"
          }`,
          html: iconHtml,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        // Create marker with custom icon
        const marker = window.L.marker([site.gpsLat!, site.gpsLng!], {
          icon: customIcon
        });

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

    setMarkers([...newMarkers, markerCluster]);

    // If we have filtered sites with coordinates, fit the map to these bounds
    if (newMarkers.length > 0) {
      const group = window.L.featureGroup(newMarkers);
      mapInstance.fitBounds(group.getBounds(), { padding: [30, 30] });
    }
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
            
            {/* Site Detail Overlay - shown when a site is selected */}
            {selectedSite && (
              <div className="absolute bottom-4 right-4 w-64 bg-white rounded-md shadow-lg z-[1000] overflow-hidden border border-primary-100">
                <div className="p-3 bg-primary-50 border-b border-primary-100 flex justify-between items-center">
                  <h3 className="font-medium text-neutral-800 text-sm">{selectedSite.name}</h3>
                  <button
                    className="text-neutral-500 hover:text-neutral-800 text-xs"
                    onClick={() => setSelectedSite(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center mr-2">
                      <i className={`fas ${selectedSite.type === "CLC" ? "fa-building" : selectedSite.type === "Satellite" ? "fa-satellite" : "fa-broadcast-tower"}`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-medium">{selectedSite.type} Site</p>
                      <p className="text-xs text-neutral-500">{selectedSite.siteId}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex">
                      <span className="text-neutral-500 w-20">District:</span>
                      <span className="text-neutral-800">{selectedSite.district}</span>
                    </div>
                    <div className="flex">
                      <span className="text-neutral-500 w-20">Status:</span>
                      <span className="text-neutral-800">{selectedSite.operationalStatus}</span>
                    </div>
                  </div>
                  
                  <Link href={`/sites/${selectedSite.id}`}>
                    <a className="text-primary-500 hover:text-primary-600 text-xs font-medium">
                      View Full Details <i className="fas fa-arrow-right ml-1"></i>
                    </a>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MapPreview;
