import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Staff, Site } from "@shared/schema";
import { ArrowLeft, Edit, User, Briefcase, GraduationCap, Award } from 'lucide-react';

const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: staff, isLoading, error } = useQuery<Staff>({
    queryKey: ["/api/staff/" + id],
  });

  const { data: site } = useQuery<Site>({
    queryKey: staff?.siteId ? [`/api/sites/${staff.siteId}`] : ['no-site'],
    enabled: !!staff?.siteId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (error || !staff) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading staff details: {error?.message || "Staff member not found"}</p>
        </div>
      </div>
    );
  }

  const getVerificationClass = (verified: boolean | null | undefined) => {
    return verified === true ? "bg-success-light text-white" : "bg-warning-light text-white";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/staff">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Staff List
          </Button>
        </Link>
        <Link href={`/staff/${id}/edit`}>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Staff Member
          </Button>
        </Link>
      </div>

      {/* Staff Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-medium text-neutral-800">{staff.firstName} {staff.lastName}</h3>
            <p className="text-neutral-500">
              {staff.position} {site && `- ${site.name}`}
            </p>
            <p className="text-sm text-neutral-400">Staff ID: {staff.staffId}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <span className={`px-3 py-1 ${getVerificationClass(staff.verified)} text-sm rounded-full flex items-center`}>
            <i className="fas fa-circle mr-1 text-xs"></i> {staff.verified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <TabsList className="w-full justify-start border-b border-neutral-200 rounded-none p-0 h-auto overflow-x-auto">
            <TabsTrigger value="overview" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <User className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <GraduationCap className="h-4 w-4 mr-2" /> Qualifications
            </TabsTrigger>
            <TabsTrigger value="skills" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <Award className="h-4 w-4 mr-2" /> Skills
            </TabsTrigger>
            <TabsTrigger value="workload" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <Briefcase className="h-4 w-4 mr-2" /> Workload
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
                    <span className="text-sm text-neutral-500">Staff ID</span>
                    <span className="text-neutral-800">{staff.staffId}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Full Name</span>
                    <span className="text-neutral-800">{staff.firstName} {staff.lastName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Position</span>
                    <span className="text-neutral-800">{staff.position || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Email</span>
                    <span className="text-neutral-800">{staff.email || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Phone</span>
                    <span className="text-neutral-800">{staff.phone || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Verification Status</span>
                    <span className="text-neutral-800">{staff.verified ? "Verified" : "Unverified"}</span>
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
                </div>
              </CardContent>
            </Card>
            
            {/* Workload Information */}
            <Card>
              <CardContent className="p-5">
                <h4 className="font-medium text-neutral-800 mb-3">Workload Information</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Weekly Hours</span>
                    <span className="text-neutral-800">{staff.workload ? `${staff.workload} hours` : "Not specified"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qualifications" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-3">Qualifications</h4>
              {Array.isArray(staff.qualifications) && staff.qualifications.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {staff.qualifications.map((qualification, index) => (
                    <li key={index} className="text-neutral-800">{qualification}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-500">No qualifications recorded for this staff member.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-3">Skills</h4>
              {staff.skills && staff.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {staff.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">No skills recorded for this staff member.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-3">Workload Details</h4>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Weekly Hours</span>
                  <span className="text-neutral-800">{staff.workload ? `${staff.workload} hours` : "Not specified"}</span>
                </div>
                {/* Additional workload information could be added here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffDetail;
