import React, { useState, ChangeEvent } from "react";
import { useForm, Controller, SubmitHandler, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertSiteSchema, type Site, type InsertSite, type District } from "@shared/schema";
import { useLocation } from "wouter"; // Import useLocation for navigation
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
import { MapPin, LocateFixed, X } from "lucide-react"; // Add X to the imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extend the insert schema for form validation
// Omit fields handled differently in the form (address, images)
// Add fields specific to the form (address, siteImages, potentially others like surroundingIndustries if needed)
const extendedSiteSchema = insertSiteSchema.omit({
  physicalAddress: true, // Use 'address' in form
  images: true,          // Use 'siteImages' in form
  gpsLat: true,          // Handle separately for number input
  gpsLng: true,          // Handle separately for number input
  // Omit fields not directly edited in this form
}).extend({
  name: z.string().min(3, { message: "Site name must be at least 3 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  district: z.string().min(1, { message: "Please select a district" }), // Use district name instead of ID
  surroundingIndustries: z.array(z.string()).optional(), 
  siteImages: z.array(z.string()).optional().default([]),
  gpsLat: z.number().nullable().optional(),
  gpsLng: z.number().nullable().optional(),
  // Add back other fields from InsertSite that are actually in the form
  siteId: z.string().min(1, { message: "Site ID is required" }), // Example: Assuming siteId is required
  type: z.string(), // Assuming type is always present
  operationalStatus: z.string(), // Assuming operationalStatus is always present
  assessmentStatus: z.string(), // Assuming assessmentStatus is always present
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Add other fields from InsertSite if they are present in your form inputs
  // Example: totalArea: z.number().int().optional().nullable(),
});

// This type represents the data structure within the form itself
type FormValues = z.infer<typeof extendedSiteSchema>;

// Helper function to upload files
const uploadFiles = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiRequest("POST", "/api/upload", formData);
  const result = await response.json() as { urls: string[] };

  if (!result || !result.urls) {
    throw new Error("File upload failed or did not return URLs.");
  }
  return result.urls;
};

interface SiteFormProps {
  initialData?: Site;
  onSuccess?: () => void;
  onCancel?: () => void; // Add onCancel prop
  isEdit?: boolean;
}

export default function SiteForm({ initialData, onSuccess, onCancel, isEdit = false }: SiteFormProps) { // Add onCancel to destructuring
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch districts for the dropdown
  const { data: districts, isLoading: isLoadingDistricts, error: districtsError } = useQuery<District[]>({
    queryKey: ["/api/districts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/districts");
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      return response.json();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSiteSchema),
    defaultValues: initialData
      ? {
          ...initialData, // Spread existing Site data
          address: initialData.physicalAddress ?? "", // Map physicalAddress to address
          district: initialData.district, // Use district name
          gpsLat: initialData.gpsLat ?? null,
          gpsLng: initialData.gpsLng ?? null,
          siteImages: initialData.images || [], // Map images to siteImages
          // Map other potentially null fields explicitly
          contactPerson: initialData.contactPerson ?? "",
          contactPhone: initialData.contactPhone ?? "",
          contactEmail: initialData.contactEmail ?? "",
          notes: initialData.notes ?? "",
          surroundingIndustries: (initialData as any).surroundingIndustries ?? [], // Keep if needed by form
          // Ensure all fields in FormValues have a default
          siteId: initialData.siteId ?? "",
          type: initialData.type ?? "CLC",
          operationalStatus: initialData.operationalStatus ?? "Active",
          assessmentStatus: initialData.assessmentStatus ?? "ToVisit",
        }
      : { // Default values for a new form
          name: "",
          type: "CLC",
          siteId: "",
          address: "",
          district: "", // Use empty string as default
          contactPerson: "",
          contactPhone: "",
          contactEmail: "",
          gpsLat: null,
          gpsLng: null,
          operationalStatus: "Active",
          assessmentStatus: "ToVisit",
          notes: "",
          surroundingIndustries: [],
          siteImages: [],
        },
  });
  const { setValue } = form;

  const mutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      // Map FormValues to the structure expected by the API (InsertSite or Partial<InsertSite>)
      const apiData: Partial<InsertSite> = {
        ...formData, // Spread validated form data
        physicalAddress: formData.address, // Map form field back to DB field
        images: formData.siteImages,       // Map form field back to DB field
        // Ensure numeric fields are numbers if needed by API
        district: formData.district, // Use district name
        gpsLat: formData.gpsLat,
        gpsLng: formData.gpsLng,
      };

      // Remove fields specific to the form schema that are not in InsertSite
      delete (apiData as any).address;
      delete (apiData as any).siteImages;
      // Delete other form-only fields if they exist (e.g., surroundingIndustries if not in InsertSite)
      delete (apiData as any).surroundingIndustries;

      const url = isEdit && initialData ? `/api/sites/${initialData.id}` : "/api/sites";
      const method = isEdit ? "PATCH" : "POST";

      const response = await apiRequest(method, url, apiData);
      return response.json() as Promise<Site>; // Add return type assertion
    },
    onSuccess: (data: Site) => { // Add type annotation for data
      // Invalidate site list and specific site detail query
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      if (isEdit && initialData) {
        queryClient.invalidateQueries({ queryKey: [`/api/sites/${initialData.id}`] });
      } else if (data?.id) { // Invalidate new site if ID is returned on create
         queryClient.invalidateQueries({ queryKey: [`/api/sites/${data.id}`] });
      }

      toast({
        title: `Site ${isEdit ? "updated" : "created"} successfully`,
        description: `The site ${data?.name ?? ''} has been ${isEdit ? "updated" : "created"}.`,
      });

      // Call the onSuccess prop (which should handle navigation back)
      if (onSuccess) {
        onSuccess();
      }
      // No need to reset form here if navigating away
      // if (!isEdit) form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} site: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  // Use SubmitHandler<FormValues> for type safety
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsUploading(true);
    let currentImageUrls: string[] = form.getValues("siteImages") || [];

    try {
      if (selectedFiles.length > 0) {
        const newImageUrls = await uploadFiles(selectedFiles);
        currentImageUrls = [...currentImageUrls, ...newImageUrls];
        // Update form state before submitting
        setValue("siteImages", currentImageUrls, { shouldValidate: true });
        // Update the data object directly for the mutation
        data.siteImages = currentImageUrls;
        setSelectedFiles([]);
      }
      mutation.mutate(data); // Pass the potentially updated data object

    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Image Upload Failed",
        description: error instanceof Error ? error.message : "Could not upload images.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // --- Geolocation Handlers ---
  const handleGetCoordinates = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation Not Supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setValue("gpsLat", parseFloat(latitude.toFixed(6)), { shouldValidate: true });
        setValue("gpsLng", parseFloat(longitude.toFixed(6)), { shouldValidate: true });
        toast({ title: "Coordinates Fetched" });
      },
      (error: GeolocationPositionError) => {
        toast({ title: "Geolocation Error", description: error.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleGetAddress = () => {
     if (!navigator.geolocation) {
      toast({ title: "Geolocation Not Supported", variant: "destructive" });
      return;
    }
     navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue("gpsLat", parseFloat(latitude.toFixed(6)), { shouldValidate: true });
        setValue("gpsLng", parseFloat(longitude.toFixed(6)), { shouldValidate: true });

        fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => {
            if (data.address && data.address !== "Address not found") {
              setValue("address", data.address, { shouldValidate: true });
              toast({ title: "Address Fetched" });
            } else {
              toast({ title: "Address Not Found", variant: "default" });
            }
          })
          .catch(err => {
             console.error("Reverse Geocoding Fetch Error:", err);
             toast({ title: "Address Lookup Error", description: err.message, variant: "destructive" });
          });
      },
      (error) => {
         toast({ title: "Geolocation Error", description: error.message, variant: "destructive" });
      },
       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  // --- End Geolocation Handlers ---

  // Add explicit type for react-hook-form generic to help with type inference
  const typedForm = form as UseFormReturn<FormValues>;

  return (
    <Form {...typedForm}> {/* Use typedForm */}
      <form onSubmit={typedForm.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={typedForm.control}
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
              control={typedForm.control}
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
              control={typedForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Updated District Dropdown */}
            <FormField
              control={typedForm.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select
                    onValueChange={field.onChange} // Parse value to int
                    value={field.value} // Convert number value to string for Select
                    disabled={isLoadingDistricts}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingDistricts ? "Loading districts..." : "Select district"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingDistricts ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : districtsError ? (
                         <SelectItem value="error" disabled>Error loading districts</SelectItem>
                      ) : (
                        districts?.map((district) => (
                          <SelectItem key={district.id} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="operationalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operational Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              control={typedForm.control}
              name="assessmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              control={typedForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Textarea
                        placeholder="Full address of the site"
                        className="resize-none flex-grow"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGetAddress}
                      aria-label="Get current address"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={typedForm.control}
                name="gpsLat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., -26.8523"
                        {...field}
                        value={field.value ?? ''} // Handle null value for input
                        onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={typedForm.control}
                name="gpsLng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                     <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 26.6665"
                          className="flex-grow"
                          {...field}
                          value={field.value ?? ''} // Handle null value
                          onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                        />
                      </FormControl>
                       <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGetCoordinates}
                        aria-label="Get current GPS coordinates"
                      >
                        <LocateFixed className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <FormField
              control={typedForm.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    {/* Ensure value is string or empty string */}
                    <Input placeholder="Name of primary contact" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +27 12 345 6789" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={typedForm.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., contact@site.edu.za" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Full Width Controls */}
        <div className="space-y-4">
          {/* Removed totalStudents and totalStaff fields */}
          {/* Removed facilities field */}

          <FormField
            control={typedForm.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information about the site"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ''} // Handle null value
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
                control={typedForm.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  // Ensure field.value is treated as an array
                  const currentValues = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={currentValues.includes('Mining')}
                          onCheckedChange={(checked) => {
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
                control={typedForm.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  const currentValues = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={currentValues.includes('Agriculture')}
                          onCheckedChange={(checked) => {
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
                control={typedForm.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  const currentValues = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={currentValues.includes('Manufacturing')}
                          onCheckedChange={(checked) => {
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
                control={typedForm.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  const currentValues = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={currentValues.includes('Healthcare')}
                          onCheckedChange={(checked) => {
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
                control={typedForm.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  const currentValues = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={currentValues.includes('Retail')}
                          onCheckedChange={(checked) => {
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
                control={typedForm.control}
                name="surroundingIndustries"
                render={({ field }) => {
                  const currentValues = Array.isArray(field.value) ? field.value : [];
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={currentValues.includes('Tourism')}
                          onCheckedChange={(checked) => {
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

            {/* Display selected image previews */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Display existing images if editing */}
            {isEdit && initialData?.images && initialData.images.length > 0 && selectedFiles.length === 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {initialData.images.map((url: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Site image ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-100 flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => {
                        const currentImages = form.getValues("siteImages") || [];
                        form.setValue(
                          "siteImages",
                          currentImages.filter((image) => image !== url),
                          { shouldValidate: true }
                        );
                      }}
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

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
                      onChange={handleFileChange}
                      disabled={isUploading || mutation.isPending}
                    />
                  </label>
                  {isUploading && <p className="text-sm text-gray-500 mt-2">Uploading images...</p>}
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
            onClick={onCancel} // Use onCancel prop for the Cancel button
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading || mutation.isPending}>
            {isUploading ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i> Uploading...
              </span>
            ) : mutation.isPending ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i> {isEdit ? "Updating..." : "Creating..."}
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
