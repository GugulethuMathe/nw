import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Site, Staff, Asset, Program } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface SiteDetailProps {
  siteId: string;
}

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId }) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: site, isLoading: siteLoading } = useQuery<Site>({
    queryKey: [`/api/sites/${siteId}`],
  });
  
  const { data: staff } = useQuery<Staff[]>({
    queryKey: [`/api/sites/${siteId}/staff`],
  });
  
  const { data: assets } = useQuery<Asset[]>({
    queryKey: [`/api/sites/${siteId}/assets`],
  });
  
  const { data: programs } = useQuery<Program[]>({
    queryKey: [`/api/sites/${siteId}/programs`],
  });

  if (siteLoading || !site) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const getSiteTypeIcon = (type: string) => {
    switch (type) {
      case "CLC":
        return "fa-building";
      case "Satellite":
        return "fa-satellite";
      case "Operational":
        return "fa-broadcast-tower";
      default:
        return "fa-building";
    }
  };

  const getStatusClass = (status: string) => {
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

  const getAssessmentStatusIcon = (status: string) => {
    switch (status) {
      case "To Visit":
        return "fa-clock";
      case "Visited":
        return "fa-check";
      case "Data Verified":
        return "fa-check-double";
      default:
        return "fa-question";
    }
  };

  const getAssessmentStatusClass = (status: string) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Site Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <i className={`fas ${getSiteTypeIcon(site.type)} text-xl`}></i>
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-medium text-neutral-800">{site.name}</h3>
            <p className="text-neutral-500">{site.type} Site - {site.district}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <span className={`px-3 py-1 ${getStatusClass(site.operationalStatus)} text-sm rounded-full flex items-center`}>
            <i className="fas fa-circle mr-1 text-xs"></i> {site.operationalStatus}
          </span>
          <span className={`px-3 py-1 ${getAssessmentStatusClass(site.assessmentStatus)} text-sm rounded-full flex items-center`}>
            <i className={`fas ${getAssessmentStatusIcon(site.assessmentStatus)} mr-1`}></i> {site.assessmentStatus}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <TabsList className="w-full justify-start border-b border-neutral-200 rounded-none p-0 h-auto overflow-x-auto">
            <TabsTrigger value="overview" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="staff" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Staff ({staff?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="programs" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Programs ({programs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="assets" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Assets
            </TabsTrigger>
            <TabsTrigger value="images" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Images
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
                    <span className="text-sm text-neutral-500">Site ID</span>
                    <span className="text-neutral-800">{site.siteId}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Physical Address</span>
                    <span className="text-neutral-800">{site.physicalAddress || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">GPS Coordinates</span>
                    <span className="text-neutral-800">
                      {site.gpsLat && site.gpsLng 
                        ? `${site.gpsLat}, ${site.gpsLng}` 
                        : "Not recorded"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Person</span>
                    <span className="text-neutral-800">{site.contactPerson || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Details</span>
                    <span className="text-neutral-800">
                      {site.contactEmail && site.contactPhone 
                        ? `${site.contactEmail} | ${site.contactPhone}` 
                        : site.contactEmail || site.contactPhone || "Not specified"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Establishment Date</span>
                    <span className="text-neutral-800">{site.establishmentDate || "Not recorded"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Agreement Details */}
            <Card>
              <CardContent className="p-5">
                <h4 className="font-medium text-neutral-800 mb-3">Agreement Details</h4>
                <div className="space-y-3">
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
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Site Images Preview */}
          {site.images && site.images.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-neutral-800 mb-3">Site Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {site.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square bg-neutral-200 rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${site.name} image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {site.images.length > 4 && (
                <div className="mt-2 text-right">
                  <Button variant="link" onClick={() => setActiveTab("images")}>
                    View all {site.images.length} images
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="infrastructure" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-5">
                <h4 className="font-medium text-neutral-800 mb-3">Infrastructure Details</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Total Area</span>
                    <span className="text-neutral-800">
                      {site.totalArea ? `${site.totalArea} m²` : "Not recorded"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Number of Classrooms</span>
                    <span className="text-neutral-800">{site.classrooms || "Not recorded"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Number of Offices</span>
                    <span className="text-neutral-800">{site.offices || "Not recorded"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Computer Labs</span>
                    <span className="text-neutral-800">{site.computerLabs || "Not recorded"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Workshops</span>
                    <span className="text-neutral-800">{site.workshops || "Not recorded"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Facilities</span>
                    <span className="text-neutral-800">
                      {[
                        site.hasLibrary ? "Library" : null,
                        site.hasStudentCommonAreas ? "Student Common Areas" : null,
                        site.hasStaffFacilities ? "Staff Facilities" : null
                      ].filter(Boolean).join(", ") || "None recorded"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-5">
                <h4 className="font-medium text-neutral-800 mb-3">Condition Assessment</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Building Structure</span>
                    <span className="text-neutral-800">{site.buildingCondition || "Not assessed"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Electrical Systems</span>
                    <span className="text-neutral-800">{site.electricalCondition || "Not assessed"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Plumbing</span>
                    <span className="text-neutral-800">{site.plumbingCondition || "Not assessed"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Interior Condition</span>
                    <span className="text-neutral-800">{site.interiorCondition || "Not assessed"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Exterior Condition</span>
                    <span className="text-neutral-800">{site.exteriorCondition || "Not assessed"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Last Renovation</span>
                    <span className="text-neutral-800">{site.lastRenovationDate || "Not recorded"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="mt-0">
          {staff && staff.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Position</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {staff.map((staffMember) => (
                        <tr key={staffMember.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-800">{staffMember.firstName} {staffMember.lastName}</div>
                            <div className="text-xs text-neutral-500">{staffMember.staffId}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{staffMember.position}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{staffMember.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${staffMember.verified ? "bg-success-light text-white" : "bg-warning-light text-white"}`}>
                              {staffMember.verified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                            <Link href={`/staff/${staffMember.id}`}>
                              <a className="text-primary-500 hover:text-primary-600">View Details</a>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="text-5xl text-neutral-300 mb-3">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Staff Records</h3>
              <p className="text-neutral-500 mb-4">There are no staff members associated with this site.</p>
              <Button>Add Staff Member</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs" className="mt-0">
          {programs && programs.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Program</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Enrollment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {programs.map((program) => (
                        <tr key={program.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-800">{program.name}</div>
                            <div className="text-xs text-neutral-500">{program.programId}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{program.category}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{program.enrollmentCount || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              program.status === "Active" ? "bg-success-light text-white" : 
                              program.status === "Inactive" ? "bg-neutral-500 text-white" : 
                              "bg-warning-light text-white"
                            }`}>
                              {program.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                            <Link href={`/programs/${program.id}`}>
                              <a className="text-primary-500 hover:text-primary-600">View Details</a>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="text-5xl text-neutral-300 mb-3">
                <i className="fas fa-book"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Programs</h3>
              <p className="text-neutral-500 mb-4">There are no programs associated with this site.</p>
              <Button>Add Program</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="mt-0">
          {assets && assets.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Asset</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Condition</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Service</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {assets.map((asset) => (
                        <tr key={asset.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-800">{asset.name}</div>
                            <div className="text-xs text-neutral-500">{asset.assetId}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{asset.category}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              asset.condition === "Good" ? "bg-success-light text-white" : 
                              asset.condition === "Fair" ? "bg-warning-light text-white" : 
                              asset.condition === "Poor" ? "bg-error-light text-white" :
                              "bg-neutral-500 text-white"
                            }`}>
                              {asset.condition}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{asset.lastServiceDate || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                            <Link href={`/assets/${asset.id}`}>
                              <a className="text-primary-500 hover:text-primary-600">View Details</a>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="text-5xl text-neutral-300 mb-3">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Assets</h3>
              <p className="text-neutral-500 mb-4">There are no assets associated with this site.</p>
              <Button>Add Asset</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="images" className="mt-0">
          <Card>
            <CardContent className="p-5">
              {site.images && site.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {site.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-neutral-200 rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`${site.name} image ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-5xl text-neutral-300 mb-3">
                    <i className="fas fa-images"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-1">No Images</h3>
                  <p className="text-neutral-500 mb-4">There are no images for this site.</p>
                  <Button>Upload Images</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/sites">
            <a>Back to Sites</a>
          </Link>
        </Button>
        <div className="space-x-2">
          <Button variant="outline">
            <i className="fas fa-download mr-2"></i>
            Export Data
          </Button>
          <Button>
            <i className="fas fa-edit mr-2"></i>
            Edit Site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SiteDetail;
