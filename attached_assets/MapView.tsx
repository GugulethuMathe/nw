import React, { useEffect, useRef, useState } from "react";
import MapFilters from "./MapFilters";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import SiteDetailModal from "@/components/site/SiteDetailModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    L: any;
  }
}

const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [mapLayer, setMapLayer] = useState("standard");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: sites, isLoading, error } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    
    // Load leaflet from CDN if not already loaded
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update markers when sites data changes
  useEffect(() => {
    if (!leafletMap.current || !sites) return;
    
    // Clear existing markers
    leafletMap.current.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker) {
        leafletMap.current.removeLayer(layer);
      }
    });
    
    // Add markers for each site
    sites.forEach(site => {
      if (!site.latitude || !site.longitude) return;
      
      const marker = createMarker(site);
      marker.addTo(leafletMap.current);
      
      // Create popup content
      const popupContent = createPopupContent(site);
      marker.bindPopup(popupContent);
    });
  }, [sites]);

  // Update map layer when selection changes
  useEffect(() => {
    if (!leafletMap.current) return;
    
    // Remove existing tile layers
    leafletMap.current.eachLayer((layer: any) => {
      if (layer instanceof window.L.TileLayer) {
        leafletMap.current.removeLayer(layer);
      }
    });
    
    // Add new tile layer based on selection
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    
    switch (mapLayer) {
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        break;
      case 'terrain':
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        attribution = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
        break;
    }
    
    window.L.tileLayer(tileUrl, { attribution }).addTo(leafletMap.current);
  }, [mapLayer]);

  const initializeMap = () => {
    if (!mapRef.current) return;
    
    // Set default view to North West Province, South Africa
    leafletMap.current = window.L.map(mapRef.current).setView([-26.8654, 26.6642], 8);
    
    // Add OpenStreetMap tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap.current);
  };

  const createMarker = (site: Site) => {
    const getMarkerColor = (siteType: string) => {
      switch(siteType) {
        case 'CLC': return 'primary-500';
        case 'Satellite': return 'success-light';
        case 'Operational': return 'warning-light';
        default: return 'neutral-500';
      }
    };
    
    const getMarkerIcon = (siteType: string) => {
      switch(siteType) {
        case 'CLC': return 'building';
        case 'Satellite': return 'satellite';
        case 'Operational': return 'map-marker';
        default: return 'question';
      }
    };
    
    // Create a custom div icon
    const icon = window.L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="w-8 h-8 bg-${getMarkerColor(site.type)} rounded-full flex items-center justify-center text-white">
               <i class="fas fa-${getMarkerIcon(site.type)}"></i>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
    
    return window.L.marker([site.latitude, site.longitude], { icon });
  };

  const createPopupContent = (site: Site) => {
    const statusColorClass = site.operationalStatus === 'Active' 
      ? 'bg-success-light text-white' 
      : site.operationalStatus === 'Inactive' 
        ? 'bg-neutral-500 text-white' 
        : 'bg-warning-light text-white';
    
    const assessmentColorClass = site.assessmentStatus === 'Data Verified' 
      ? 'bg-primary-500 text-white' 
      : site.assessmentStatus === 'Visited' 
        ? 'bg-primary-300 text-white' 
        : 'bg-neutral-300 text-neutral-700';
    
    const popupContent = document.createElement('div');
    popupContent.className = 'p-1';
    popupContent.innerHTML = `
      <h3 class="font-medium text-base">${site.name}</h3>
      <p class="text-neutral-600 text-sm">${site.type} - ${site.district}</p>
      <div class="flex items-center mt-1 mb-2">
        <span class="inline-block px-2 py-0.5 text-xs ${statusColorClass} rounded-full mr-1">
          ${site.operationalStatus}
        </span>
        <span class="inline-block px-2 py-0.5 text-xs ${assessmentColorClass} rounded-full">
          ${site.assessmentStatus}
        </span>
      </div>
      <div class="flex justify-between text-xs text-neutral-600 mb-2">
        <div>Staff: ${site.staffCount || 0}</div>
        <div>Programs: ${site.programCount || 0}</div>
      </div>
      <button 
        class="w-full bg-primary-500 text-white text-sm py-1 px-2 rounded hover:bg-primary-600 transition-colors"
      >
        View Details
      </button>
    `;
    
    // Add event listener to the button
    setTimeout(() => {
      const button = popupContent.querySelector('button');
      if (button) {
        button.addEventListener('click', () => {
          setSelectedSite(site);
          setIsModalOpen(true);
        });
      }
    }, 0);
    
    return popupContent;
  };

  const handleMapLayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMapLayer(e.target.value);
  };

  const handleZoomIn = () => {
    if (leafletMap.current) {
      leafletMap.current.setZoom(leafletMap.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (leafletMap.current) {
      leafletMap.current.setZoom(leafletMap.current.getZoom() - 1);
    }
  };

  const handleUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (leafletMap.current) {
            leafletMap.current.setView(
              [position.coords.latitude, position.coords.longitude],
              13
            );
          }
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }
  };

  return (
    <section className="flex flex-col md:flex-row h-full">
      <MapFilters />
      
      <div className="flex-1 relative">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-md shadow-md p-2 flex space-x-2">
          <button 
            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-500 focus:outline-none"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <i className="fas fa-plus"></i>
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-500 focus:outline-none"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <i className="fas fa-minus"></i>
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-primary-500 focus:outline-none"
            onClick={handleUserLocation}
            aria-label="My location"
          >
            <i className="fas fa-location-arrow"></i>
          </button>
        </div>
        
        {/* Map Container */}
        {isLoading ? (
          <div className="map-container flex items-center justify-center bg-neutral-100">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading map...</p>
            </div>
          </div>
        ) : error ? (
          <div className="map-container flex items-center justify-center bg-neutral-100">
            <Card className="w-full max-w-md mx-4 text-center p-6">
              <div className="text-error-light text-5xl mb-4">
                <i className="fas fa-map-marked-alt"></i>
              </div>
              <h3 className="text-xl font-medium mb-2">Failed to load map data</h3>
              <p className="text-neutral-600 mb-4">
                We couldn't load the site data for the map. Please try again later.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <i className="fas fa-redo mr-2"></i> Retry
              </Button>
            </Card>
          </div>
        ) : (
          <div ref={mapRef} className="map-container"></div>
        )}
        
        {/* Map Layer Controls */}
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-md shadow-md p-2">
          <div className="space-y-1">
            <label className="flex items-center text-sm">
              <input 
                type="radio" 
                name="mapLayer" 
                value="standard" 
                className="h-4 w-4 text-primary-500" 
                checked={mapLayer === "standard"} 
                onChange={handleMapLayerChange}
              />
              <span className="ml-2 text-neutral-700">Standard</span>
            </label>
            <label className="flex items-center text-sm">
              <input 
                type="radio" 
                name="mapLayer" 
                value="satellite" 
                className="h-4 w-4 text-primary-500" 
                checked={mapLayer === "satellite"} 
                onChange={handleMapLayerChange}
              />
              <span className="ml-2 text-neutral-700">Satellite</span>
            </label>
            <label className="flex items-center text-sm">
              <input 
                type="radio" 
                name="mapLayer" 
                value="terrain" 
                className="h-4 w-4 text-primary-500" 
                checked={mapLayer === "terrain"} 
                onChange={handleMapLayerChange}
              />
              <span className="ml-2 text-neutral-700">Terrain</span>
            </label>
          </div>
        </div>
        
        {/* Quick Actions Button */}
        <div className="absolute bottom-4 right-4 z-10">
          <button 
            className="w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg flex items-center justify-center hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-colors"
            aria-label="Add new site"
          >
            <i className="fas fa-plus text-xl"></i>
          </button>
        </div>
      </div>
      
      {/* Site Detail Modal */}
      {selectedSite && (
        <SiteDetailModal 
          site={selectedSite} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </section>
  );
};

export default MapView;
