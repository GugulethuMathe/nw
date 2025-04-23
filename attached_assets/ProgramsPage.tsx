import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProgramsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Programs & Courses</h1>
          <p className="text-neutral-500">
            Manage and track educational programs
          </p>
        </div>
        <Button className="mt-4 md:mt-0 bg-primary-500 hover:bg-primary-600">
          <i className="fas fa-plus mr-2"></i> Add New Program
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Programs Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-neutral-400 text-5xl mb-4">
              <i className="fas fa-book"></i>
            </div>
            <h3 className="text-xl font-medium mb-2">Programs Module Coming Soon</h3>
            <p className="text-neutral-600 mb-6 max-w-lg mx-auto">
              The programs and courses management module is currently under development. Check back soon for full functionality to manage educational offerings.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button variant="outline">
                <i className="fas fa-file-import mr-2"></i> Import Program Data
              </Button>
              <Button>
                <i className="fas fa-bell mr-2"></i> Get Notified When Ready
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramsPage;
