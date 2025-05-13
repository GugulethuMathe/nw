import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Site } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InfrastructureFormProps {
  site: Site;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InfrastructureForm({ site, onSuccess, onCancel }: InfrastructureFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("infrastructure");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Infrastructure details form state
  const [formData, setFormData] = useState({
    // Infrastructure details
    totalArea: site.totalArea || "",
    classrooms: site.classrooms || "",
    offices: site.offices || "",
    computerLabs: site.computerLabs || "",
    workshops: site.workshops || "",
    hasLibrary: site.hasLibrary || false,
    hasStudentCommonAreas: site.hasStudentCommonAreas || false,
    hasStaffFacilities: site.hasStaffFacilities || false,
    notes: site.notes || "",
    
    // Condition assessment
    buildingCondition: site.buildingCondition || "Not assessed",
    electricalCondition: site.electricalCondition || "Not assessed",
    plumbingCondition: site.plumbingCondition || "Not assessed",
    interiorCondition: site.interiorCondition || "Not assessed",
    exteriorCondition: site.exteriorCondition || "Not assessed",
    lastRenovationDate: site.lastRenovationDate || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      
      // Convert string values to numbers where appropriate
      const payload = {
        ...formData,
        totalArea: formData.totalArea ? Number(formData.totalArea) : null,
        classrooms: formData.classrooms ? Number(formData.classrooms) : null,
        offices: formData.offices ? Number(formData.offices) : null,
        computerLabs: formData.computerLabs ? Number(formData.computerLabs) : null,
        workshops: formData.workshops ? Number(formData.workshops) : null,
      };
      
      const response = await fetch(`/api/sites/${site.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update infrastructure details');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate site detail query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${site.id}`] });
      
      toast({
        title: "Infrastructure details updated",
        description: `Infrastructure details for ${site.name} have been updated successfully.`,
      });
      
      // Call the onSuccess prop (which should handle closing the dialog)
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update infrastructure details: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const conditionOptions = [
    "Not assessed",
    "Excellent",
    "Good",
    "Fair",
    "Poor",
    "Critical"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="infrastructure">Infrastructure Details</TabsTrigger>
          <TabsTrigger value="condition">Condition Assessment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="infrastructure" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalArea">Total Area (m²)</Label>
              <Input
                id="totalArea"
                name="totalArea"
                type="number"
                value={formData.totalArea}
                onChange={handleInputChange}
                placeholder="Total area in square meters"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classrooms">Number of Classrooms</Label>
              <Input
                id="classrooms"
                name="classrooms"
                type="number"
                value={formData.classrooms}
                onChange={handleInputChange}
                placeholder="Number of classrooms"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="offices">Number of Offices</Label>
              <Input
                id="offices"
                name="offices"
                type="number"
                value={formData.offices}
                onChange={handleInputChange}
                placeholder="Number of offices"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="computerLabs">Computer Labs</Label>
              <Input
                id="computerLabs"
                name="computerLabs"
                type="number"
                value={formData.computerLabs}
                onChange={handleInputChange}
                placeholder="Number of computer labs"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workshops">Workshops</Label>
              <Input
                id="workshops"
                name="workshops"
                type="number"
                value={formData.workshops}
                onChange={handleInputChange}
                placeholder="Number of workshops"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastRenovationDate">Last Renovation Date</Label>
              <Input
                id="lastRenovationDate"
                name="lastRenovationDate"
                type="date"
                value={formData.lastRenovationDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label>Facilities</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasLibrary" 
                  checked={formData.hasLibrary}
                  onCheckedChange={(checked) => handleCheckboxChange('hasLibrary', checked === true)}
                />
                <label htmlFor="hasLibrary" className="text-sm text-neutral-700">
                  Library
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasStudentCommonAreas" 
                  checked={formData.hasStudentCommonAreas}
                  onCheckedChange={(checked) => handleCheckboxChange('hasStudentCommonAreas', checked === true)}
                />
                <label htmlFor="hasStudentCommonAreas" className="text-sm text-neutral-700">
                  Student Common Areas
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasStaffFacilities" 
                  checked={formData.hasStaffFacilities}
                  onCheckedChange={(checked) => handleCheckboxChange('hasStaffFacilities', checked === true)}
                />
                <label htmlFor="hasStaffFacilities" className="text-sm text-neutral-700">
                  Staff Facilities
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes about the infrastructure"
              rows={4}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="condition" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buildingCondition">Building Structure</Label>
              <Select 
                value={formData.buildingCondition}
                onValueChange={(value) => handleSelectChange('buildingCondition', value)}
              >
                <SelectTrigger id="buildingCondition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="electricalCondition">Electrical Systems</Label>
              <Select 
                value={formData.electricalCondition}
                onValueChange={(value) => handleSelectChange('electricalCondition', value)}
              >
                <SelectTrigger id="electricalCondition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plumbingCondition">Plumbing</Label>
              <Select 
                value={formData.plumbingCondition}
                onValueChange={(value) => handleSelectChange('plumbingCondition', value)}
              >
                <SelectTrigger id="plumbingCondition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interiorCondition">Interior Condition</Label>
              <Select 
                value={formData.interiorCondition}
                onValueChange={(value) => handleSelectChange('interiorCondition', value)}
              >
                <SelectTrigger id="interiorCondition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exteriorCondition">Exterior Condition</Label>
              <Select 
                value={formData.exteriorCondition}
                onValueChange={(value) => handleSelectChange('exteriorCondition', value)}
              >
                <SelectTrigger id="exteriorCondition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating...
            </>
          ) : (
            'Update Infrastructure'
          )}
        </Button>
      </div>
    </form>
  );
}
