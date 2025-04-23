import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertSiteSchema, type Site } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extend the insert schema to add more validation
const extendedSiteSchema = insertSiteSchema.extend({
  name: z.string().min(3, { message: "Site name must be at least 3 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  district: z.string().min(1, { message: "District is required" }),
  surroundingIndustries: z.array(z.string()).optional(),
  siteImages: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof extendedSiteSchema>;

interface SiteFormProps {
  initialData?: Site;
  onSuccess?: () => void;
  isEdit?: boolean;
}

export default function SiteForm({ initialData, onSuccess, isEdit = false }: SiteFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSiteSchema),
    defaultValues: initialData || {
      name: "",
      type: "CLC",
      siteId: "",
      address: "",
      district: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      gpsCoordinates: "",
      operationalStatus: "Active",
      assessmentStatus: "ToVisit",
      totalStudents: 0,
      totalStaff: 0,
      facilities: "",
      notes: "",
      surroundingIndustries: [],
      siteImages: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (isEdit && initialData) {
        return apiRequest(`/api/sites/${initialData.id}`, {
          method: "PATCH",
          data,
        });
      } else {
        return apiRequest("/api/sites", {
          method: "POST",
          data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      toast({
        title: `Site ${isEdit ? "updated" : "created"} successfully`,
        description: `The site has been ${isEdit ? "updated" : "created"}.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (!isEdit) {
        form.reset();
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CLC-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
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
                  <FormLabel>Site Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select site type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CLC">Community Learning Center</SelectItem>
                      <SelectItem value="Satellite">Satellite</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
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
                  <FormLabel>District</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bojanala">Bojanala</SelectItem>
                      <SelectItem value="Dr Kenneth Kaunda">Dr Kenneth Kaunda</SelectItem>
                      <SelectItem value="Dr Ruth Segomotsi Mompati">Dr Ruth Segomotsi Mompati</SelectItem>
                      <SelectItem value="Ngaka Modiri Molema">Ngaka Modiri Molema</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operationalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operational Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormLabel>Assessment Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ToVisit">To Visit</SelectItem>
                      <SelectItem value="Visited">Visited</SelectItem>
                      <SelectItem value="DataVerified">Data Verified</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Full address of the site"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gpsCoordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPS Coordinates</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., -26.8523, 26.6665" {...field} />
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
                    <Input placeholder="Name of primary contact" {...field} />
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
                    <Input placeholder="e.g., +27 12 345 6789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., contact@site.edu.za" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Full Width Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Students</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalStaff"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Staff</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="facilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facilities</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Description of facilities available (classrooms, labs, etc.)"
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional information about the site"
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Surrounding Industries Checkboxes */}
          <div className="space-y-2">
            <FormLabel>Surrounding Industries</FormLabel>
            <FormDescription>
              Select the industries that surround this site
            </FormDescription>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <FormField
                control={form.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('Mining')}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            return checked
                              ? field.onChange([...currentValues, 'Mining'])
                              : field.onChange(
                                  currentValues.filter((value) => value !== 'Mining')
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Mining</FormLabel>
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('Agriculture')}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            return checked
                              ? field.onChange([...currentValues, 'Agriculture'])
                              : field.onChange(
                                  currentValues.filter((value) => value !== 'Agriculture')
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Agriculture</FormLabel>
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('Manufacturing')}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            return checked
                              ? field.onChange([...currentValues, 'Manufacturing'])
                              : field.onChange(
                                  currentValues.filter((value) => value !== 'Manufacturing')
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Manufacturing</FormLabel>
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('Healthcare')}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            return checked
                              ? field.onChange([...currentValues, 'Healthcare'])
                              : field.onChange(
                                  currentValues.filter((value) => value !== 'Healthcare')
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Healthcare</FormLabel>
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('Retail')}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            return checked
                              ? field.onChange([...currentValues, 'Retail'])
                              : field.onChange(
                                  currentValues.filter((value) => value !== 'Retail')
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Retail</FormLabel>
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('Tourism')}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            return checked
                              ? field.onChange([...currentValues, 'Tourism'])
                              : field.onChange(
                                  currentValues.filter((value) => value !== 'Tourism')
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Tourism</FormLabel>
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          
          {/* Image Upload Area */}
          <div className="space-y-2">
            <FormLabel>Site Images</FormLabel>
            <FormDescription>
              Upload images of the site
            </FormDescription>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 mt-2">
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                    <span>Upload images</span>
                    <Input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        // In a real implementation, you would handle file uploads here
                        console.log("Files selected:", e.target.files);
                        // Currently just a placeholder
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {isEdit ? "Updating..." : "Creating..."}
              </span>
            ) : (
              <>{isEdit ? "Update" : "Create"} Site</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}