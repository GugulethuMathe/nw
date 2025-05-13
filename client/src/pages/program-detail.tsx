import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Program, Site } from "@shared/schema";
import { ArrowLeft, Edit, BookOpen, Calendar, Users, Info } from 'lucide-react';

const ProgramDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: program, isLoading, error } = useQuery<Program>({
    queryKey: ["/api/programs/" + id],
  });

  const { data: site } = useQuery<Site>({
    queryKey: program?.siteId ? [`/api/sites/${program.siteId}`] : ['no-site'],
    enabled: !!program?.siteId,
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
  
  if (error || !program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading program details: {error?.message || "Program not found"}</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Buttons */}      <div className="flex justify-between items-center mb-4">
        <Link href={site ? `/sites/${site.id}` : "/programs"}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {site ? 'Site' : 'Programs List'}
          </Button>
        </Link>
        <Link href={`/programs/${id}/edit`}>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Program
          </Button>
        </Link>
      </div>

      {/* Program Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-medium text-neutral-800">{program.name}</h3>
            <p className="text-neutral-500">
              {program.category} {site && `- ${site.name}`}
            </p>
            <p className="text-sm text-neutral-400">Program ID: {program.programId}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <span className={`px-3 py-1 ${getStatusClass(program.status)} text-sm rounded-full flex items-center`}>
            <i className="fas fa-circle mr-1 text-xs"></i> {program.status}
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
            <TabsTrigger value="schedule" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <Calendar className="h-4 w-4 mr-2" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="enrollment" className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 rounded-none">
              <Users className="h-4 w-4 mr-2" /> Enrollment
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
                    <span className="text-sm text-neutral-500">Program ID</span>
                    <span className="text-neutral-800">{program.programId}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Name</span>
                    <span className="text-neutral-800">{program.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Category</span>
                    <span className="text-neutral-800">{program.category}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-500">Status</span>
                    <span className="text-neutral-800">{program.status}</span>
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
            
            {/* Description */}
            <Card>
              <CardContent className="p-5">
                <h4 className="font-medium text-neutral-800 mb-3">Description</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-neutral-800 whitespace-pre-wrap">{program.description || "No description provided for this program."}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-3">Program Schedule</h4>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Start Date</span>
                  <span className="text-neutral-800">{program.startDate || "Not specified"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">End Date</span>
                  <span className="text-neutral-800">{program.endDate || "Not specified"}</span>
                </div>
                {/* Additional schedule information could be added here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment" className="mt-0">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-medium text-neutral-800 mb-3">Enrollment Information</h4>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500">Current Enrollment</span>
                  <span className="text-neutral-800">{program.enrollmentCount || "0"} students</span>
                </div>
                {/* Additional enrollment information could be added here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgramDetail;
