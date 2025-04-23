import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TutorialSettings } from '@/components/tutorial/TutorialSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Settings</h1>
        <p className="text-neutral-500">
          Configure application preferences and access help resources.
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="help">Help & Tutorial</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                General application settings will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Appearance settings will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help">
          <TutorialSettings />
          
          <Card>
            <CardHeader>
              <CardTitle>Help Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-neutral-600">
                  Access additional help resources and documentation for the Baseline Assessment System.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">User Manual</h3>
                    <p className="text-neutral-500 mb-3">
                      Comprehensive guide with detailed information on all system features.
                    </p>
                    <a 
                      href="#" 
                      className="text-primary-500 hover:text-primary-600 font-medium inline-flex items-center"
                    >
                      View Manual
                      <i className="fas fa-arrow-right ml-2 text-xs"></i>
                    </a>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">FAQ</h3>
                    <p className="text-neutral-500 mb-3">
                      Answers to commonly asked questions about the system.
                    </p>
                    <a 
                      href="#" 
                      className="text-primary-500 hover:text-primary-600 font-medium inline-flex items-center"
                    >
                      View FAQ
                      <i className="fas fa-arrow-right ml-2 text-xs"></i>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About the System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-neutral-600">
                  The North West CET College Baseline Assessment System (BAS) is a comprehensive 
                  management platform for tracking facilities, staff, assets, and programs across 
                  different educational sites.
                </p>
                
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h3 className="text-md font-medium mb-2">Version Information</h3>
                  <ul className="space-y-1 text-neutral-600">
                    <li>
                      <span className="font-medium mr-2">Version:</span>
                      <span>1.0.0</span>
                    </li>
                    <li>
                      <span className="font-medium mr-2">Last Updated:</span>
                      <span>April 2023</span>
                    </li>
                    <li>
                      <span className="font-medium mr-2">Developed by:</span>
                      <span>North West CET College IT Department</span>
                    </li>
                  </ul>
                </div>
                
                <p className="text-neutral-500 text-sm">
                  © 2023 North West CET College. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;