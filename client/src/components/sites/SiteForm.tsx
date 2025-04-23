import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSiteSchema, Site } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSyncData } from "@/hooks/useSyncData";

// Extend the schema with additional validation
const extendedSiteSchema = insertSiteSchema.extend({
  physicalAddress: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),
  gpsLat: z.string().regex(/^-?\d+(\.\d+)?$/, "Must be a valid coordinate").optional().or(z.literal("")),
  gpsLng: z.string().regex(/^-?\d+(\.\d+)?$/, "Must be a valid coordinate").optional().or(z.literal("")),
  contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
  contactPhone: z.string().regex(/^\+?[0-9\s\-()]+$/, "Must be a valid phone number").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof extendedSiteSchema>;

interface SiteFormProps {
  initialData?: Site;
  onSuccess?: () => void;
  isEdit?: boolean;
}

const SiteForm: React.FC<SiteFormProps> = ({ initialData, onSuccess, isEdit = false }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addToSyncQueue, isOffline } = useSyncData();
  
  // Initialize the form with default values or existing data
  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSiteSchema),
    defaultValues: initialData || {
      siteId: "",
      name: "",
      type: "CLC",
      district: "",
      physicalAddress: "",
      gpsLat: "",
      gpsLng: "",
      hostDepartment: "",
      agreementType: "Owned",
      agreementDetails: "",
      contractNumber: "",
      contractTerm: "",
      renewalDate: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      establishmentDate: "",
      operationalStatus: "Active",
      assessmentStatus: "To Visit",
      classrooms: 0,
      offices: 0,
      computerLabs: 0,
      workshops: 0,
      hasLibrary: false,
      hasStudentCommonAreas: false,
      hasStaffFacilities: false,
      accessibilityFeatures: "",
      internetConnectivity: "",
      securityFeatures: "",
      buildingCondition: "Good",
      electricalCondition: "Good",
      plumbingCondition: "Good",
      interiorCondition: "Good",
      exteriorCondition: "Good",
      notes: "",
    },
  });

  // Handle form submission with mutation
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert string GPS coordinates to numbers if provided
      const formattedData = {
        ...data,
        gpsLat: data.gpsLat ? parseFloat(data.gpsLat) : undefined,
        gpsLng: data.gpsLng ? parseFloat(data.gpsLng) : undefined,
      };
      
      if (isOffline) {
        // Handle offline submission by storing in sync queue
        addToSyncQueue(
          isEdit ? `/api/sites/${initialData?.id}` : '/api/sites',
          isEdit ? 'PATCH' : 'POST',
          formattedData
        );
        return { success: true };
      } else {
        // Normal online submission
        const response = await apiRequest(
          isEdit ? 'PATCH' : 'POST',
          isEdit ? `/api/sites/${initialData?.id}` : '/api/sites',
          formattedData
        );
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sites'] });
      toast({
        title: isEdit ? "Site Updated" : "Site Created",
        description: isEdit 
          ? `${form.getValues().name} has been updated successfully.` 
          : `${form.getValues().name} has been created successfully.`,
        variant: "default",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} site: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  // List of districts in North West Province
  const districts = [
    "Bojanala",
    "Dr Kenneth Kaunda",
    "Dr Ruth Segomotsi Mompati",
    "Ngaka Modiri Molema"
  ];

  // Condition rating options
  const conditionOptions = ["Good", "Fair", "Poor", "Critical"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-medium text-neutral-800 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site ID*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CLC-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for this site
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Klerksdorp CLC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Type*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select site type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CLC">CLC</SelectItem>
                      <SelectItem value="Satellite">Satellite</SelectItem>
                      <SelectItem value="Operational">Operational</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="physicalAddress"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Physical Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gpsLat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPS Latitude</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., -26.8521" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gpsLng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPS Longitude</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 26.6693" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+27 xxx xxx xxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="operationalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operational Status*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Planned">Planned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assessmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Status*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="To Visit">To Visit</SelectItem>
                      <SelectItem value="Visited">Visited</SelectItem>
                      <SelectItem value="Data Verified">Data Verified</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-medium text-neutral-800 mb-4">Agreement Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="agreementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agreement Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Owned">Owned</SelectItem>
                      <SelectItem value="Rented">Rented</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hostDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host Department/Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Department of Public Works" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contractNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., NWPW-2015-0342" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contractTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Term</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 5 Years (Renewable)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="renewalDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renewal Date</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2025-03-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="agreementDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Agreement Details</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any other relevant agreement information" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-medium text-neutral-800 mb-4">Infrastructure Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="classrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Classrooms</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="offices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Offices</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="computerLabs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Computer Labs</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workshops"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workshops</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Area (m²)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <FormField
              control={form.control}
              name="hasLibrary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Library</FormLabel>
                    <FormDescription>
                      Site has a dedicated library
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasStudentCommonAreas"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Student Common Areas</FormLabel>
                    <FormDescription>
                      Site has student common areas
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasStaffFacilities"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Staff Facilities</FormLabel>
                    <FormDescription>
                      Site has dedicated staff facilities
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-medium text-neutral-800 mb-4">Condition Assessment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["buildingCondition", "electricalCondition", "plumbingCondition", "interiorCondition", "exteriorCondition"].map((condition) => (
              <FormField
                key={condition}
                control={form.control}
                name={condition as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {condition
                        .replace("Condition", " Condition")
                        .split(/(?=[A-Z])/)
                        .join(" ")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditionOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            
            <FormField
              control={form.control}
              name="lastRenovationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Renovation Date</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2018-05-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information about this site" 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isEdit ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>{isEdit ? "Update Site" : "Create Site"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SiteForm;
