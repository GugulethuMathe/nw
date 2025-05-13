import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Site, Staff, Asset, Program } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import InfrastructureForm from "@/components/sites/InfrastructureForm";
import DocumentForm from "@/components/sites/DocumentForm";
import RecommendationForm from "@/components/sites/RecommendationForm";
import ImageUploadForm from "@/components/sites/ImageUploadForm";
import ActivityList from "@/components/sites/ActivityList";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { ArrowLeft, Edit, Building, FileText, ClipboardList, Lightbulb, Upload } from 'lucide-react'; // Add more icon imports

interface SiteDetailProps {
  siteId: string;
}

const SiteDetail: React.FC<SiteDetailProps> = ({ siteId }) => {
  // All useState hooks
  const [activeTab, setActiveTab] = useState("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isInfrastructureDialogOpen, setIsInfrastructureDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false);
  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{ id: number; name: string } | null>(null);
  const [programToDelete, setProgramToDelete] = useState<{ id: number; name: string } | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProgramDialogOpen, setDeleteProgramDialogOpen] = useState(false);
  const [deleteAssetDialogOpen, setDeleteAssetDialogOpen] = useState(false);

  // Hooks and context
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // All queries
  const { data: site, isLoading: siteLoading, error: siteError } = useQuery<Site>({
    queryKey: [`/api/sites/${siteId}`],
  });
  
  const { data: staff } = useQuery<Staff[]>({
    queryKey: [`/api/sites/${siteId}/staff`],
  });
  
  const { data: assets, isLoading: assetsLoading, error: assetsError } = useQuery<Asset[]>({
    queryKey: [`/api/sites/${siteId}/assets`],
  });
  
  const { data: programs } = useQuery<Program[]>({
    queryKey: [`/api/sites/${siteId}/programs`],
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (staffId: number) => {
      const response = await apiRequest("DELETE", `/api/staff/${staffId}`);
      if (!response.ok) {
        throw new Error('Failed to delete staff member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/staff`] });
      toast({
        title: "Staff member deleted",
        description: "The staff member has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete staff member: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: number) => {
      const response = await apiRequest("DELETE", `/api/programs/${programId}`);
      if (!response.ok) {
        throw new Error('Failed to delete program');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/programs`] });
      toast({
        title: "Program deleted",
        description: "The program has been successfully deleted.",
      });
      setDeleteProgramDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete program: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: number) => {
      const response = await apiRequest("DELETE", `/api/assets/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/assets`] });
      toast({
        title: "Asset deleted",
        description: "The asset has been successfully deleted.",
      });
      setDeleteAssetDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete asset: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Functions
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      deleteMutation.mutate(staffToDelete.id);
    }
  };

  const confirmProgramDelete = () => {
    if (programToDelete) {
      deleteProgramMutation.mutate(programToDelete.id);
    }
  };

  const confirmAssetDelete = () => {
    if (assetToDelete) {
      deleteAssetMutation.mutate(assetToDelete.id);
    }
  };

  // Loading and error states
  if (siteLoading || !site) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (siteError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading site details: {siteError.message}</p>
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
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/sites">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sites List
          </Button>
        </Link>
        <Link href={`/sites/${siteId}/edit`}>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Site
          </Button>
        </Link>
      </div>

      {/* Site Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <i className={`fas ${getSiteTypeIcon(site.type)} text-xl`}></i>
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-medium text-neutral-800">{site.name}</h3>
            <p className="text-neutral-500">
              {site.type} Site - {site.district ?? 'N/A'} {/* Display district name directly from site object */}
            </p>
            <p className="text-sm text-neutral-400">Site ID: {site.siteId}</p> {/* Add Site ID here */}
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
              Assets {assetsLoading ? '(Loading...)' : assetsError ? '(Error)' : `(${assets?.length || 0})`}
            </TabsTrigger>
            <TabsTrigger value="images" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Images ({site.images?.filter(url => {
                const ext = url.split('.').pop()?.toLowerCase();
                return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp';
              }).length || 0})
            </TabsTrigger>
            <TabsTrigger value="documents" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Documents ({site.images?.filter(url => {
                const ext = url.split('.').pop()?.toLowerCase();
                return ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'xls' || 
                       ext === 'xlsx' || ext === 'txt' || ext === 'csv' || ext === 'ppt' || ext === 'pptx';
              }).length || 0})
            </TabsTrigger>
            <TabsTrigger value="updates" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Updates
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              Recommendations
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
                    <span className="text-sm text-neutral-500">District</span>
                    <span className="text-neutral-800">{site.district ?? 'N/A'}</span>
                  </div>
                 
            
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Person</span>
                    <span className="text-neutral-800">{site.contactPerson || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Phone</span>
                    <span className="text-neutral-800">{site.contactPhone || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Email</span>
                    <span className="text-neutral-800">{site.contactEmail || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Establishment Date</span>
                    <span className="text-neutral-800">{site.establishmentDate || "Not recorded"}</span>
                  </div>
                  {/* Surrounding Industries - Removed as property doesn't exist on Site type */}
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
          <div className="flex justify-end mb-4 space-x-2">
            <Button 
              size="sm" 
              onClick={() => setIsInfrastructureDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Building className="h-4 w-4" /> Update Infrastructure
            </Button>
          </div>
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
                    <span className="text-sm text-neutral-500">Contact Person</span>
                    <span className="text-neutral-800">{site.contactPerson || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Phone</span>
                    <span className="text-neutral-800">{site.contactPhone || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Contact Email</span>
                    <span className="text-neutral-800">{site.contactEmail || "Not specified"}</span>
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
                      ].filter(Boolean).join(", ") || <span className="text-neutral-500 italic">None recorded</span>}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Notes</span>
                    <span className="text-neutral-800 whitespace-pre-wrap">{site.notes || "No notes"}</span>
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
          <div className="flex justify-end mb-4">
            <Link href={`/staff/add?siteId=${siteId}`}>
              <Button size="sm">Add Staff Member</Button>
            </Link>
          </div>
          {staff && staff.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((staffMember) => (
                      <TableRow key={staffMember.id}>
                        <TableCell>
                          <div className="font-medium">{staffMember.firstName} {staffMember.lastName}</div>
                          <div className="text-xs text-neutral-500">{staffMember.staffId}</div>
                        </TableCell>
                        <TableCell>{staffMember.position}</TableCell>
                        <TableCell>{staffMember.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${staffMember.verified ? "bg-success-light text-white" : "bg-warning-light text-white"}`}>
                            {staffMember.verified ? "Verified" : "Unverified"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/staff/${staffMember.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/staff/${staffMember.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setStaffToDelete({ 
                                  id: staffMember.id, 
                                  name: `${staffMember.firstName} ${staffMember.lastName}` 
                                });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="text-5xl text-neutral-300 mb-3">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Staff Records</h3>
              <p className="text-neutral-500 mb-4">There are no staff members associated with this site.</p>
              <Link href={`/staff/add?siteId=${siteId}`}>
                <Button>Add Staff Member</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs" className="mt-0">
          <div className="flex justify-end mb-4">
            <Link href={`/programs/add?siteId=${siteId}`}>
              <Button size="sm">Add Program</Button>
            </Link>
          </div>
          {programs && programs.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>
                          <div className="font-medium">{program.name}</div>
                          <div className="text-xs text-neutral-500">{program.programId}</div>
                        </TableCell>
                        <TableCell>{program.category}</TableCell>
                        <TableCell>{program.enrollmentCount || "N/A"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            program.status === "Active" ? "bg-success-light text-white" :
                            program.status === "Inactive" ? "bg-neutral-500 text-white" :
                            "bg-warning-light text-white"
                          }`}>
                            {program.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/programs/${program.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/programs/${program.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setProgramToDelete({ 
                                  id: program.id, 
                                  name: program.name 
                                });
                                setDeleteProgramDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="text-5xl text-neutral-300 mb-3">
                <i className="fas fa-scroll"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-1">No Programs Recorded</h3>
              <p className="text-neutral-500 mb-4">There are no programs associated with this site.</p>
              <Link href={`/programs/add?siteId=${siteId}`}>
                <Button>Add Program</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets" className="mt-0">
          <div className="flex justify-end mb-4">
            <Link href={`/assets/add?siteId=${siteId}`}>
              <Button size="sm">Add Asset</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-4">Site Assets</h4>
              {assets === undefined && <p>Loading assets...</p>}
              {assets && assets.length === 0 && (
                <p className="text-neutral-500 text-center py-4">No assets recorded for this site.</p>
              )}
              {assets && assets.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Condition</TableHead> {/* Changed from Status */}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-neutral-500">{asset.assetId}</div>
                        </TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            asset.condition === 'Good' ? 'bg-success-light text-white' :
                            asset.condition === 'Fair' ? 'bg-primary-300 text-white' :
                            asset.condition === 'Poor' ? 'bg-warning-light text-white' :
                            asset.condition === 'Critical' ? 'bg-red-500 text-white' :
                            'bg-neutral-500 text-white'
                          }`}>
                            {asset.condition}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/assets/${asset.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/assets/${asset.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setAssetToDelete({ 
                                  id: asset.id, 
                                  name: asset.name 
                                });
                                setDeleteAssetDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button 
              size="sm" 
              onClick={() => setIsImageUploadDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Upload className="h-4 w-4" /> Upload Image
            </Button>
          </div>
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-4">
                Site Images ({site.images?.filter(url => {
                  const ext = url.split('.').pop()?.toLowerCase();
                  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp';
                }).length || 0})
              </h4>
              {site.images && site.images.filter(url => {
                const ext = url.split('.').pop()?.toLowerCase();
                return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp';
              }).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {site.images.filter(url => {
                    const ext = url.split('.').pop()?.toLowerCase();
                    return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'webp';
                  }).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden rounded-md border border-neutral-200 relative group"
                    >
                      <img
                        src={image}
                        alt={`${site.name} image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => openLightbox(index)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to remove this image?")) {
                            fetch(`/api/sites/${siteId}/images/${index}`, {
                              method: 'DELETE',
                            })
                            .then(response => {
                              if (!response.ok) throw new Error('Failed to delete image');
                              return response.json();
                            })
                            .then(() => window.location.reload())
                            .catch(error => {
                              console.error('Error deleting image:', error);
                              alert('Failed to delete image. Please try again.');
                            });
                          }
                        }}
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-neutral-200">
                  <div className="text-5xl text-neutral-300 mb-3">
                    <i className="fas fa-image"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-1">No Images Available</h3>
                  <p className="text-neutral-500">There are no images uploaded for this site.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button 
              size="sm" 
              onClick={() => setIsDocumentDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" /> Upload Document
            </Button>
          </div>
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-4">
                Documents ({site.images?.filter(url => {
                  const ext = url.split('.').pop()?.toLowerCase();
                  return ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'xls' || 
                         ext === 'xlsx' || ext === 'txt' || ext === 'csv' || ext === 'ppt' || ext === 'pptx';
                }).length || 0})
              </h4>
              {site.images && site.images.filter(url => {
                const ext = url.split('.').pop()?.toLowerCase();
                return ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'xls' || 
                       ext === 'xlsx' || ext === 'txt' || ext === 'csv' || ext === 'ppt' || ext === 'pptx';
              }).length > 0 ? (
                <div className="space-y-2">
                  {site.images.filter(url => {
                    const ext = url.split('.').pop()?.toLowerCase();
                    return ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'xls' || 
                           ext === 'xlsx' || ext === 'txt' || ext === 'csv' || ext === 'ppt' || ext === 'pptx';
                  }).map((docUrl, index) => {
                    const urlParts = docUrl.split('/');
                    const fileName = urlParts[urlParts.length - 1];
                    // Decode the filename to show proper characters
                    const decodedFileName = decodeURIComponent(fileName.replace(/\+/g, ' '));
                    const fileExt = decodedFileName.split('.').pop()?.toLowerCase();
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-neutral-50">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-primary-500" />
                          <div>
                            <p className="font-medium">{decodedFileName}</p>
                            <p className="text-xs text-neutral-500">
                              {fileExt?.toUpperCase()} Document
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a 
                            href={docUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-600 text-sm"
                          >
                            Download
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Are you sure you want to remove this document?")) {
                                fetch(`/api/sites/${siteId}/images/${index}`, {
                                  method: 'DELETE',
                                })
                                .then(response => {
                                  if (!response.ok) throw new Error('Failed to delete document');
                                  return response.json();
                                })
                                .then(() => window.location.reload())
                                .catch(error => {
                                  console.error('Error deleting document:', error);
                                  alert('Failed to delete document. Please try again.');
                                });
                              }
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
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
                  <p className="text-neutral-500 mb-4">There are no documents associated with this site.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-4">Recent Activities</h4>
              <ActivityList siteId={parseInt(siteId)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button 
              size="sm" 
              onClick={() => setIsRecommendationDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Lightbulb className="h-4 w-4" /> Add Recommendation
            </Button>
          </div>
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-4">Recommendations</h4>
              <ActivityList siteId={parseInt(siteId)} filter="recommendation" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lightbox Component */}
      {site?.images && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={site.images.map(img => ({ src: img }))} // Map image strings directly to slides
          index={lightboxIndex}
        />
      )}

      {/* Infrastructure Update Dialog */}
      {site && (
        <Dialog open={isInfrastructureDialogOpen} onOpenChange={setIsInfrastructureDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Infrastructure Details</DialogTitle>
              <DialogDescription>
                Update infrastructure details and condition assessment for {site.name}.
              </DialogDescription>
            </DialogHeader>
            <InfrastructureForm 
              site={site} 
              onSuccess={() => setIsInfrastructureDialogOpen(false)}
              onCancel={() => setIsInfrastructureDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Document Upload Dialog */}
      {site && (
        <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
              <DialogDescription>
                Upload documents for {site.name}.
              </DialogDescription>
            </DialogHeader>
            <DocumentForm 
              site={site} 
              onSuccess={() => setIsDocumentDialogOpen(false)}
              onCancel={() => setIsDocumentDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Recommendation Dialog */}
      {site && (
        <Dialog open={isRecommendationDialogOpen} onOpenChange={setIsRecommendationDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Recommendation</DialogTitle>
              <DialogDescription>
                Add a recommendation for {site.name}.
              </DialogDescription>
            </DialogHeader>
            <RecommendationForm 
              site={site} 
              onSuccess={() => setIsRecommendationDialogOpen(false)}
              onCancel={() => setIsRecommendationDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Image Upload Dialog */}
      {site && (
        <Dialog open={isImageUploadDialogOpen} onOpenChange={setIsImageUploadDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Images</DialogTitle>
              <DialogDescription>
                Upload images for {site.name}.
              </DialogDescription>
            </DialogHeader>
            <ImageUploadForm 
              site={site} 
              onSuccess={() => setIsImageUploadDialogOpen(false)}
              onCancel={() => setIsImageUploadDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Staff Member Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {staffToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Program Confirmation Dialog */}
      <Dialog open={deleteProgramDialogOpen} onOpenChange={setDeleteProgramDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {programToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProgramDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmProgramDelete} disabled={deleteProgramMutation.isPending}>
              {deleteProgramMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Asset Confirmation Dialog */}
      <Dialog open={deleteAssetDialogOpen} onOpenChange={setDeleteAssetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {assetToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAssetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmAssetDelete} disabled={deleteAssetMutation.isPending}>
              {deleteAssetMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteDetail;
