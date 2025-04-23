import React, { useState } from "react";
import { Site } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SiteDetailModalProps {
  site: Site;
  isOpen: boolean;
  onClose: () => void;
}

const SiteDetailModal: React.FC<SiteDetailModalProps> = ({ site, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success-light text-white";
      case "Inactive":
        return "bg-neutral-500 text-white";
      default:
        return "bg-warning-light text-white";
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CLC":
        return "fa-building";
      case "Satellite":
        return "fa-satellite";
      default:
        return "fa-map-marker";
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-neutral-800">
            Site Details: {site.name}
          </DialogTitle>
        </DialogHeader>
        
        {/* Site Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full ${getStatusIcon(site.operationalStatus)} flex items-center justify-center`}>
              <i className={`fas ${getTypeIcon(site.type)} text-xl`}></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-neutral-800">{site.name}</h3>
              <p className="text-neutral-500">{site.type === "CLC" ? "Main Community Learning Center" : site.type}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <span className={`px-3 py-1 ${getStatusIcon(site.operationalStatus)} text-sm rounded-full flex items-center`}>
              <i className="fas fa-check-circle mr-1"></i> {site.operationalStatus}
            </span>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full flex items-center">
              <i className="fas fa-map-pin mr-1"></i> {site.district}
            </span>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-neutral-200 w-full justify-start mb-6 overflow-x-auto space-x-6">
            <TabsTrigger value="overview" className="px-1">Overview</TabsTrigger>
            <TabsTrigger value="infrastructure" className="px-1">Infrastructure</TabsTrigger>
            <TabsTrigger value="staff" className="px-1">Staff ({site.staffCount || 0})</TabsTrigger>
            <TabsTrigger value="programs" className="px-1">Programs ({site.programCount || 0})</TabsTrigger>
            <TabsTrigger value="assets" className="px-1">Assets</TabsTrigger>
            <TabsTrigger value="images" className="px-1">Images</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-800 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Site ID</span>
                    <span className="text-neutral-800">{site.id}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Physical Address</span>
                    <span className="text-neutral-800">{site.address || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">GPS Coordinates</span>
                    <span className="text-neutral-800">{site.latitude}, {site.longitude}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Person</span>
                    <span className="text-neutral-800">{site.contactPerson || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Details</span>
                    <span className="text-neutral-800">{site.contactDetails || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Establishment Date</span>
                    <span className="text-neutral-800">{site.establishmentDate || "Not specified"}</span>
                  </div>
                </div>
              </div>
              
              {/* Agreement Details */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-800 mb-3">Agreement Details</h4>
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Agreement Type</span>
                    <span className="text-neutral-800">{site.agreementType || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Host Department</span>
                    <span className="text-neutral-800">{site.hostDepartment || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contract Number</span>
                    <span className="text-neutral-800">{site.contractNumber || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contract Term</span>
                    <span className="text-neutral-800">{site.contractTerm || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Renewal Date</span>
                    <span className="text-neutral-800">{site.renewalDate || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Monthly Cost</span>
                    <span className="text-neutral-800">{site.monthlyCost || "Not specified"}</span>
                  </div>
                </div>
              </div>
              
              {/* Assessment Status */}
              <div className="bg-primary-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-800 mb-3">Assessment Status</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="relative flex items-center justify-center">
                      <div className={`w-8 h-8 rounded-full ${site.assessmentStatus === "To Visit" ? "bg-neutral-300 text-neutral-700" : "bg-success-light text-white"} flex items-center justify-center`}>
                        <i className={`fas ${site.assessmentStatus === "To Visit" ? "fa-clock" : "fa-check"}`}></i>
                      </div>
                      <div className="absolute w-1 h-8 bg-neutral-300 -bottom-8 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-neutral-800">Site Visit</p>
                      <p className="text-sm text-neutral-500">
                        {site.visitDate 
                          ? `${site.visitDate} by ${site.visitedBy || "Unknown"}`
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="relative flex items-center justify-center">
                      <div className={`w-8 h-8 rounded-full ${site.assessmentStatus === "To Visit" || site.assessmentStatus === "Visited" ? "bg-neutral-300 text-neutral-700" : "bg-success-light text-white"} flex items-center justify-center`}>
                        <i className={`fas ${site.assessmentStatus === "To Visit" || site.assessmentStatus === "Visited" ? "fa-clock" : "fa-check"}`}></i>
                      </div>
                      <div className="absolute w-1 h-8 bg-neutral-300 -bottom-8 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-neutral-800">Data Verification</p>
                      <p className="text-sm text-neutral-500">
                        {site.verificationDate 
                          ? `${site.verificationDate} by ${site.verifiedBy || "Unknown"}`
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-neutral-800">Final Approval</p>
                      <p className="text-sm text-neutral-500">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Site Statistics */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-800 mb-3">Site Statistics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded border border-neutral-200">
                    <p className="text-sm text-neutral-500">Total Staff</p>
                    <p className="text-xl font-medium text-neutral-800">{site.staffCount || 0}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-neutral-200">
                    <p className="text-sm text-neutral-500">Programs</p>
                    <p className="text-xl font-medium text-neutral-800">{site.programCount || 0}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-neutral-200">
                    <p className="text-sm text-neutral-500">Classrooms</p>
                    <p className="text-xl font-medium text-neutral-800">{site.classrooms || 0}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-neutral-200">
                    <p className="text-sm text-neutral-500">Assets</p>
                    <p className="text-xl font-medium text-neutral-800">{site.assetCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Site Images */}
            <div className="mt-6">
              <h4 className="font-medium text-neutral-800 mb-3">Site Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {site.images && site.images.length > 0 ? (
                  site.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-neutral-200 rounded-lg overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={image.caption || `${site.name} image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 md:col-span-4 p-8 bg-neutral-50 rounded-lg text-center">
                    <div className="text-neutral-400 text-4xl mb-2">
                      <i className="fas fa-images"></i>
                    </div>
                    <p className="text-neutral-600">No images have been uploaded for this site.</p>
                  </div>
                )}
                <div className="aspect-square bg-neutral-200 rounded-lg overflow-hidden flex items-center justify-center text-neutral-500 cursor-pointer hover:bg-neutral-300 transition-colors">
                  <div className="text-center">
                    <i className="fas fa-plus text-xl"></i>
                    <p className="text-sm mt-1">Add Photo</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="infrastructure">
            <div className="text-center py-8">
              <div className="text-neutral-400 text-5xl mb-4">
                <i className="fas fa-tools"></i>
              </div>
              <h3 className="text-xl font-medium text-neutral-800 mb-2">Infrastructure Details</h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                Infrastructure details for this site are being collected. Check back later for more information.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="staff">
            <div className="text-center py-8">
              <div className="text-neutral-400 text-5xl mb-4">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-xl font-medium text-neutral-800 mb-2">Staff Details</h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                Staff information for this site is being collected. Check back later for more information.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="programs">
            <div className="text-center py-8">
              <div className="text-neutral-400 text-5xl mb-4">
                <i className="fas fa-book"></i>
              </div>
              <h3 className="text-xl font-medium text-neutral-800 mb-2">Programs Details</h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                Program information for this site is being collected. Check back later for more information.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="assets">
            <div className="text-center py-8">
              <div className="text-neutral-400 text-5xl mb-4">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h3 className="text-xl font-medium text-neutral-800 mb-2">Assets Details</h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                Asset information for this site is being collected. Check back later for more information.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="images">
            <div className="text-center py-8">
              <div className="text-neutral-400 text-5xl mb-4">
                <i className="fas fa-images"></i>
              </div>
              <h3 className="text-xl font-medium text-neutral-800 mb-2">Site Images</h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                More site images will be available here. Check back later for more information.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="border-t border-neutral-200 pt-4 flex justify-between items-center">
          <div className="flex items-center text-neutral-500 text-sm">
            <i className="fas fa-clock mr-1"></i>
            <span>Last updated: {site.lastUpdated || "Unknown"}</span>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="default" className="bg-primary-500 hover:bg-primary-600">
              Edit Site
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SiteDetailModal;
