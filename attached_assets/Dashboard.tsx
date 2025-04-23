import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Dashboard: React.FC = () => {
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });

  const stats = {
    totalSites: sites?.length || 0,
    visitedSites: sites?.filter(site => site.assessmentStatus === "Visited" || site.assessmentStatus === "Data Verified").length || 0,
    verifiedSites: sites?.filter(site => site.assessmentStatus === "Data Verified").length || 0,
    pendingSites: sites?.filter(site => site.assessmentStatus === "To Visit").length || 0,
    activeSites: sites?.filter(site => site.operationalStatus === "Active").length || 0,
    inactiveSites: sites?.filter(site => site.operationalStatus === "Inactive").length || 0,
    plannedSites: sites?.filter(site => site.operationalStatus === "Planned").length || 0,
  };

  const completionPercentage = Math.round((stats.verifiedSites / (stats.totalSites || 1)) * 100);

  // Data for charts
  const sitesByType = [
    { name: "CLC", value: sites?.filter(site => site.type === "CLC").length || 0 },
    { name: "Satellite", value: sites?.filter(site => site.type === "Satellite").length || 0 },
    { name: "Operational", value: sites?.filter(site => site.type === "Operational").length || 0 },
  ];

  const sitesByDistrict = [
    { name: "Bojanala", sites: sites?.filter(site => site.district === "Bojanala").length || 0 },
    { name: "Dr Kenneth Kaunda", sites: sites?.filter(site => site.district === "Dr Kenneth Kaunda").length || 0 },
    { name: "Dr Ruth S. Mompati", sites: sites?.filter(site => site.district === "Dr Ruth Segomotsi Mompati").length || 0 },
    { name: "Ngaka Modiri Molema", sites: sites?.filter(site => site.district === "Ngaka Modiri Molema").length || 0 },
  ];

  const COLORS = ['#1976D2', '#4CAF50', '#FF9800', '#F44336'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Dashboard</h1>
        <p className="text-neutral-500">
          Overview of the college baseline assessment project progress
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Sites</CardTitle>
            <CardDescription>All centers and satellites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-neutral-800">{stats.totalSites}</span>
              <div className="ml-auto p-2 bg-primary-100 text-primary-500 rounded-full">
                <i className="fas fa-building text-xl"></i>
              </div>
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              {completionPercentage}% verified
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Sites Visited</CardTitle>
            <CardDescription>Field assessment completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-neutral-800">{stats.visitedSites}</span>
              <div className="ml-auto p-2 bg-success-light bg-opacity-20 text-success-light rounded-full">
                <i className="fas fa-check-circle text-xl"></i>
              </div>
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              {Math.round((stats.visitedSites / (stats.totalSites || 1)) * 100)}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Data Verified</CardTitle>
            <CardDescription>Full verification completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-neutral-800">{stats.verifiedSites}</span>
              <div className="ml-auto p-2 bg-primary-500 bg-opacity-20 text-primary-500 rounded-full">
                <i className="fas fa-clipboard-check text-xl"></i>
              </div>
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              {Math.round((stats.verifiedSites / (stats.totalSites || 1)) * 100)}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pending Visits</CardTitle>
            <CardDescription>Sites awaiting assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-neutral-800">{stats.pendingSites}</span>
              <div className="ml-auto p-2 bg-warning-light bg-opacity-20 text-warning-light rounded-full">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              {Math.round((stats.pendingSites / (stats.totalSites || 1)) * 100)}% of total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sites by Type</CardTitle>
            <CardDescription>Distribution of center types</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sitesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sitesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sites by District</CardTitle>
            <CardDescription>Distribution across districts</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sitesByDistrict}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sites" fill="#1976D2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Operational Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Operational Status</CardTitle>
          <CardDescription>Current status of all sites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-neutral-700">Active Sites</h3>
                <span className="px-2 py-1 bg-success-light text-white text-xs rounded-full">
                  {Math.round((stats.activeSites / (stats.totalSites || 1)) * 100)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-neutral-800">{stats.activeSites}</p>
              <p className="text-sm text-neutral-500 mt-1">Currently operational</p>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-neutral-700">Inactive Sites</h3>
                <span className="px-2 py-1 bg-neutral-500 text-white text-xs rounded-full">
                  {Math.round((stats.inactiveSites / (stats.totalSites || 1)) * 100)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-neutral-800">{stats.inactiveSites}</p>
              <p className="text-sm text-neutral-500 mt-1">Currently non-operational</p>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-neutral-700">Planned Sites</h3>
                <span className="px-2 py-1 bg-warning-light text-white text-xs rounded-full">
                  {Math.round((stats.plannedSites / (stats.totalSites || 1)) * 100)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-neutral-800">{stats.plannedSites}</p>
              <p className="text-sm text-neutral-500 mt-1">Future implementation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-neutral-600">Loading activity...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center mr-3 mt-1">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <p className="text-neutral-800 font-medium">Klerksdorp CLC Data Verified</p>
                  <p className="text-sm text-neutral-500">Data verification completed by R. Smith</p>
                  <p className="text-xs text-neutral-400 mt-1">Today, 14:30</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-success-light bg-opacity-20 text-success-light flex items-center justify-center mr-3 mt-1">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div>
                  <p className="text-neutral-800 font-medium">Potchefstroom CLC Visit Completed</p>
                  <p className="text-sm text-neutral-500">Site assessment done by T. Mokoena</p>
                  <p className="text-xs text-neutral-400 mt-1">Yesterday, 11:15</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-warning-light bg-opacity-20 text-warning-light flex items-center justify-center mr-3 mt-1">
                  <i className="fas fa-camera"></i>
                </div>
                <div>
                  <p className="text-neutral-800 font-medium">New Photos Added</p>
                  <p className="text-sm text-neutral-500">5 new photos uploaded for Mahikeng CLC</p>
                  <p className="text-xs text-neutral-400 mt-1">Jan 20, 2024, 09:45</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center mr-3 mt-1">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div>
                  <p className="text-neutral-800 font-medium">Staff Records Updated</p>
                  <p className="text-sm text-neutral-500">15 staff records verified at Rustenburg CLC</p>
                  <p className="text-xs text-neutral-400 mt-1">Jan 18, 2024, 16:20</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
