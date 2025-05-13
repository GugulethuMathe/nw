import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Asset, Site } from "@shared/schema";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ArrowLeft, Edit, Package, Image, FileText, Wrench, Info } from 'lucide-react';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: asset, isLoading, error } = useQuery<Asset>({
    queryKey: ["/api/assets/" + id],
  });

  const { data: site } = useQuery<Site>({
    queryKey: asset?.siteId ? [`/api/sites/${asset.siteId}`] : ['no-site'],
    enabled: !!asset?.siteId,
  });

  // Define the openLightbox function
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (error || !asset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading asset details: {error?.message || "Asset not found"}</p>
        </div>
      </div>
    );
  }

  const getConditionClass = (condition: string) => {
    switch (condition) {
      case "Excellent":
        return "bg-success-light text-white";
      case "Good":
        return "bg-primary-500 text-white";
      case "Fair":
        return "bg-primary-300 text-white";
      case "Poor":
        return "bg-warning-light text-white";
      case "Critical":
      case "NonFunctional":
        return "bg-red-500 text-white";
      default:
        return "bg-neutral-500 text-white";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Equipment":
        return "fa-tools";
      case "Furniture":
        return "fa-chair";
      case "IT":
        return "fa-laptop";
      case "Teaching":
        return "fa-chalkboard-teacher";
      case "Office":
        return "fa-briefcase";
      default:
        return "fa-box";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4">
        <Link href={site ? `/sites/${site.id}` : "/assets"}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {site ? 'Site' : 'Assets List'}
          </Button>
        </Link>
        <Link href={`/assets/${id}/edit`}>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Asset
          </Button>
        </Link>
      </div>

      {/* Asset Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <i className={`fas ${getCategoryIcon(asset.category)} text-xl`}></i>
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-medium text-neutral-800">{asset.name}</h3>
            <p className="text-neutral-500">
              {asset.type || asset.category} {site && `- ${site.name}`}
            </p>
            <p className="text-sm text-neutral-400">Asset ID: {asset.assetId}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <span className={`px-3 py-1 ${getConditionClass(asset.condition)} text-sm rounded-full flex items-center`}>
            <i className="fas fa-circle mr-1 text-xs"></i> {asset.condition}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <TabsList className="w-full justify-start border-b border-neutral-200 rounded-none p-0 h-auto overflow-x-auto">
            <TabsTrigger value="overview" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <Info className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="specifications" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <Package className="h-4 w-4 mr-2" /> Specifications
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <Wrench className="h-4 w-4 mr-2" /> Maintenance
            </TabsTrigger>
            {asset.images && asset.images.length > 0 && (
              <TabsTrigger value="images" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
                <Image className="h-4 w-4 mr-2" /> Images ({asset.images.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="documents" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <FileText className="h-4 w-4 mr-2" /> Documents
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="p-5">
                <h4 className="font-medium text-neutral-800 mb-3">Basic Information</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Asset ID</span>
                    <span className="text-neutral-800">{asset.assetId}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Name</span>
                    <span className="text-neutral-800">{asset.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Type</span>
                    <span className="text-neutral-800">{asset.type || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Category</span>
                    <span className="text-neutral-800">{asset.category}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Condition</span>
                    <span className="text-neutral-800">{asset.condition}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Location</span>
                    <span className="text-neutral-800">{asset.location || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Assigned Site</span>
                    <span className="text-neutral-800">
                      {site ? (
                        <Link href={`/sites/${site.id}`} className="text-primary-500 hover:underline">
                          {site.name} ({site.siteId})
                        </Link>
                      ) : (
                        "Not assigned to any site"
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Assigned To</span>
                    <span className="text-neutral-800">{asset.assignedTo || "Not assigned"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Notes */}
            <Card>
              <CardContent className="p-5">
                <h4 className="font-medium text-neutral-800 mb-3">Additional Notes</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-neutral-800 whitespace-pre-wrap">{asset.notes || "No additional notes recorded for this asset."}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Asset Images Preview */}
          {asset.images && asset.images.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-neutral-800 mb-3">Asset Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {asset.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square bg-neutral-200 rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${asset.name} image ${index + 1}`} 
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openLightbox(index)}
                    />
                  </div>
                ))}
              </div>
              {asset.images.length > 4 && (
                <div className="mt-2 text-right">
                  <Button variant="link" onClick={() => setActiveTab("images")}>
                    View all {asset.images.length} images
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="specifications" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-3">Technical Specifications</h4>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Manufacturer</span>
                  <span className="text-neutral-800">{asset.manufacturer || "Not specified"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Model</span>
                  <span className="text-neutral-800">{asset.model || "Not specified"}</span>
                </div>                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Serial Numbers</span>
                  {asset.serialNumbers && asset.serialNumbers.length > 0 ? (
                    <div className="space-y-1">
                      {asset.serialNumbers.map((serial, index) => (
                        <span key={index} className="text-neutral-800 block">{serial}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral-800">Not specified</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Purchase Date</span>
                  <span className="text-neutral-800">{asset.purchaseDate || "Not recorded"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Purchase Price</span>
                  <span className="text-neutral-800">{asset.purchasePrice ? `R${asset.purchasePrice}` : "Not recorded"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-3">Maintenance Information</h4>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Last Maintenance Date</span>
                  <span className="text-neutral-800">{asset.lastMaintenanceDate || "Not recorded"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Next Maintenance Date</span>
                  <span className="text-neutral-800">{asset.nextMaintenanceDate || "Not scheduled"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Current Condition</span>
                  <span className="text-neutral-800">{asset.condition}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-4">Asset Images</h4>
              {asset.images && asset.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {asset.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded-md border border-neutral-200 relative group"
                    >
                      <img
                        src={image}
                        alt={`${asset.name} image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => openLightbox(index)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-neutral-200">
                  <div className="text-5xl text-neutral-300 mb-3">
                    <i className="fas fa-image"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-1">No Images Available</h3>
                  <p className="text-neutral-500">There are no images uploaded for this asset.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-4">Documents</h4>
              {/* Filter images to show only documents (based on file extension) */}
              {asset.images && asset.images.some(url => {
                const ext = url.split('.').pop()?.toLowerCase();
                return ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'xls' || 
                       ext === 'xlsx' || ext === 'txt' || ext === 'csv' || ext === 'ppt' || ext === 'pptx';
              }) ? (
                <div className="space-y-2">
                  {asset.images.filter(url => {
                    const ext = url.split('.').pop()?.toLowerCase();
                    return ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'xls' || 
                           ext === 'xlsx' || ext === 'txt' || ext === 'csv' || ext === 'ppt' || ext === 'pptx';
                  }).map((docUrl, index) => {
                    const fileName = docUrl.split('/').pop() || 'Document';
                    const fileExt = fileName.split('.').pop()?.toLowerCase();
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-neutral-50">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-primary-500" />
                          <div>
                            <p className="font-medium">{fileName}</p>
                            <p className="text-xs text-neutral-500">
                              {fileExt?.toUpperCase()} Document
                            </p>
                          </div>
                        </div>
                        <a 
                          href={docUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600 text-sm"
                        >
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-neutral-200">
                  <div className="text-5xl text-neutral-300 mb-3">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-1">No Documents Available</h3>
                  <p className="text-neutral-500 mb-4">There are no documents associated with this asset.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lightbox Component */}
      {asset?.images && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={asset.images.map(img => ({ src: img }))}
          index={lightboxIndex}
        />
      )}
    </div>
  );
};

export default AssetDetail;
