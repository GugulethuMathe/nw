import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ReportsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Reports</h1>
          <p className="text-neutral-500">
            Generate and view project reports
          </p>
        </div>
        <Button className="mt-4 md:mt-0 bg-primary-500 hover:bg-primary-600">
          <i className="fas fa-file-export mr-2"></i> Export Reports
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="site">
            <TabsList className="mb-6">
              <TabsTrigger value="site">Site Reports</TabsTrigger>
              <TabsTrigger value="staff">Staff Reports</TabsTrigger>
              <TabsTrigger value="assets">Asset Reports</TabsTrigger>
              <TabsTrigger value="programs">Program Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="site">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-primary-500 text-3xl mb-3">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Site Assessment Summary</h3>
                    <p className="text-neutral-500 text-sm mb-4">
                      Complete overview of all site assessments with status and findings.
                    </p>
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-download mr-2"></i> Generate
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-primary-500 text-3xl mb-3">
                      <i className="fas fa-map-marked-alt"></i>
                    </div>
                    <h3 className="text-lg font-medium mb-2">GIS Mapping Report</h3>
                    <p className="text-neutral-500 text-sm mb-4">
                      Geographic distribution of all sites with coordinates and mapping data.
                    </p>
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-download mr-2"></i> Generate
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-primary-500 text-3xl mb-3">
                      <i className="fas fa-tools"></i>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Infrastructure Report</h3>
                    <p className="text-neutral-500 text-sm mb-4">
                      Detailed report on facilities, rooms, and infrastructure conditions.
                    </p>
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-download mr-2"></i> Generate
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="staff">
              <div className="text-center py-8">
                <div className="text-neutral-400 text-5xl mb-4">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-xl font-medium mb-2">Staff Reports Coming Soon</h3>
                <p className="text-neutral-600 mb-4 max-w-lg mx-auto">
                  Staff reporting functionality is under development and will be available soon.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="assets">
              <div className="text-center py-8">
                <div className="text-neutral-400 text-5xl mb-4">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <h3 className="text-xl font-medium mb-2">Asset Reports Coming Soon</h3>
                <p className="text-neutral-600 mb-4 max-w-lg mx-auto">
                  Asset reporting functionality is under development and will be available soon.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="programs">
              <div className="text-center py-8">
                <div className="text-neutral-400 text-5xl mb-4">
                  <i className="fas fa-book"></i>
                </div>
                <h3 className="text-xl font-medium mb-2">Program Reports Coming Soon</h3>
                <p className="text-neutral-600 mb-4 max-w-lg mx-auto">
                  Program reporting functionality is under development and will be available soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
