import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Site, Staff, Asset, Program } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState("site");
  const [exportFormat, setExportFormat] = useState("pdf");
  
  const { data: sites } = useQuery<Site[]>({
    queryKey: ['/api/sites'],
  });
  
  const { data: staff } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });
  
  const { data: assets } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });
  
  const { data: programs } = useQuery<Program[]>({
    queryKey: ['/api/programs'],
  });

  // Prepare chart data
  const sitesByType = [
    { name: "CLC", value: sites?.filter(site => site.type === "CLC").length || 0 },
    { name: "Satellite", value: sites?.filter(site => site.type === "Satellite").length || 0 },
    { name: "Operational", value: sites?.filter(site => site.type === "Operational").length || 0 },
  ];

  const sitesByStatus = [
    { name: "Active", value: sites?.filter(site => site.operationalStatus === "Active").length || 0 },
    { name: "Inactive", value: sites?.filter(site => site.operationalStatus === "Inactive").length || 0 },
    { name: "Planned", value: sites?.filter(site => site.operationalStatus === "Planned").length || 0 },
  ];

  const sitesByDistrict = [
    { name: "Bojanala", count: sites?.filter(site => site.district === "Bojanala").length || 0 },
    { name: "Dr Kenneth Kaunda", count: sites?.filter(site => site.district === "Dr Kenneth Kaunda").length || 0 },
    { name: "Dr Ruth S. Mompati", count: sites?.filter(site => site.district === "Dr Ruth Segomotsi Mompati").length || 0 },
    { name: "Ngaka Modiri Molema", count: sites?.filter(site => site.district === "Ngaka Modiri Molema").length || 0 },
  ];

  const assetsByCondition = [
    { name: "Good", value: assets?.filter(asset => asset.condition === "Good").length || 0 },
    { name: "Fair", value: assets?.filter(asset => asset.condition === "Fair").length || 0 },
    { name: "Poor", value: assets?.filter(asset => asset.condition === "Poor").length || 0 },
    { name: "Critical", value: assets?.filter(asset => asset.condition === "Critical").length || 0 },
  ];

  const staffVerification = [
    { name: "Verified", value: staff?.filter(member => member.verified).length || 0 },
    { name: "Unverified", value: staff?.filter(member => !member.verified).length || 0 },
  ];

  const programsByStatus = [
    { name: "Active", value: programs?.filter(program => program.status === "Active").length || 0 },
    { name: "Inactive", value: programs?.filter(program => program.status === "Inactive").length || 0 },
    { name: "Planned", value: programs?.filter(program => program.status === "Planned").length || 0 },
  ];

  const COLORS = ['#1976D2', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#FF5722'];

  const handleExportReport = () => {
    // This would be implemented with a backend report generation service
    alert(`Exporting ${reportType} report as ${exportFormat}...`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Reports</h1>
          <p className="text-neutral-500">
            Generate and view comprehensive reports
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="site">Site Report</SelectItem>
              <SelectItem value="staff">Staff Report</SelectItem>
              <SelectItem value="asset">Asset Report</SelectItem>
              <SelectItem value="program">Program Report</SelectItem>
              <SelectItem value="summary">Summary Report</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportReport}>
            <i className="fas fa-download mr-2"></i>
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="visual">Visual Reports</TabsTrigger>
          <TabsTrigger value="tabular">Tabular Data</TabsTrigger>
          <TabsTrigger value="matrix">Project Matrix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Site Type Distribution */}
            <Card>
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
            
            {/* Site Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Sites by Status</CardTitle>
                <CardDescription>Operational status distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sitesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sitesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Sites by District */}
            <Card>
              <CardHeader>
                <CardTitle>Sites by District</CardTitle>
                <CardDescription>Geographic distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sitesByDistrict}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976D2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Assets by Condition */}
            <Card>
              <CardHeader>
                <CardTitle>Assets by Condition</CardTitle>
                <CardDescription>Condition assessment summary</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetsByCondition}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {assetsByCondition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Staff Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Verification Status</CardTitle>
                <CardDescription>Progress on staff verification</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={staffVerification}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {staffVerification.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Programs by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Programs by Status</CardTitle>
                <CardDescription>Status of educational programs</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={programsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {programsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tabular">
          <Card>
            <CardHeader>
              <CardTitle>Tabular Reports</CardTitle>
              <CardDescription>Detailed data in table format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <div className="text-5xl text-neutral-300 mb-3">
                  <i className="fas fa-table"></i>
                </div>
                <h3 className="text-lg font-medium text-neutral-700 mb-1">Generate Tabular Report</h3>
                <p className="text-neutral-500 mb-4">Select report options and click 'Generate' to view tabular data.</p>
                <Button>Generate Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Project Matrix</CardTitle>
              <CardDescription>Cross-reference sites, programs, and staff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <div className="text-5xl text-neutral-300 mb-3">
                  <i className="fas fa-project-diagram"></i>
                </div>
                <h3 className="text-lg font-medium text-neutral-700 mb-1">Project Matrix Generator</h3>
                <p className="text-neutral-500 mb-4">Create a matrix showing relationships between various entities.</p>
                <Button>Generate Matrix</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
