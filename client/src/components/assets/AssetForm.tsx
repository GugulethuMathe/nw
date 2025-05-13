import React, { useState, ChangeEvent } from "react";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertAssetSchema, type Asset, type Site, type InsertAsset } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { FormDescription } from "@/components/ui/form";
import { X, Plus } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form schema based on fields actually present in the form
const assetFormSchema = z.object({
  name: z.string().min(3, { message: "Asset name must be at least 3 characters" }),
  assetId: z.string().min(1, { message: "Asset ID is required" }),
  type: z.string().min(2, { message: "Asset type is required" }),
  category: z.string().min(1, "Category is required"),
  manufacturer: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumbers: z.array(z.string()).default([]),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.number().nullable().optional(),
  condition: z.string().min(1, "Condition is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  location: z.string().optional().nullable(),
  siteId: z.number().nullable().optional(),
  assignedTo: z.string().optional().nullable(),
  lastMaintenanceDate: z.string().optional().nullable(),
  nextMaintenanceDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  assetImages: z.array(z.string()).optional().default([]), // For form handling
});

type FormValues = z.infer<typeof assetFormSchema>;

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

interface AssetFormProps {
  initialData?: Asset;
  onSuccess?: (newAsset?: Asset) => void;
  onCancel?: () => void;
  isEdit?: boolean;
  preSelectedSiteId?: number;
}

export default function AssetForm({
  initialData,
  onSuccess,
  onCancel,
  isEdit = false,
  preSelectedSiteId
}: AssetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const sitesQuery = useQuery<Site[]>({
    queryKey: ["/api/sites"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/sites');
      if (!response.ok) throw new Error('Failed to fetch sites');
      return response.json();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name ?? "",
          assetId: initialData.assetId ?? "",
          type: initialData.type ?? "",
          category: initialData.category ?? "Equipment",
          manufacturer: initialData.manufacturer ?? "",
          model: initialData.model ?? "",
          serialNumbers: initialData.serialNumbers ?? [],
          purchaseDate: initialData.purchaseDate ?? "",
          purchasePrice: initialData.purchasePrice ? Number(initialData.purchasePrice) : null,
          condition: initialData.condition ?? "Good",
          location: initialData.location ?? "",
          siteId: initialData.siteId ?? null,
          assignedTo: initialData.assignedTo ?? "",
          lastMaintenanceDate: initialData.lastMaintenanceDate ?? "",
          nextMaintenanceDate: initialData.nextMaintenanceDate ?? "",
          notes: initialData.notes ?? "",
          quantity: 1, // This is not in the schema, but used in the form
          assetImages: initialData.images || [], // Map images to assetImages
        }
      : {
          name: "",
          assetId: `ASSET-${new Date().getTime().toString().slice(-6)}`, // Generate a default asset ID
          type: "",
          category: "Equipment",
          manufacturer: "",
          model: "",
          serialNumbers: [],
          purchaseDate: "",
          purchasePrice: null,
          condition: "Good",
          quantity: 1,
          location: "",
          siteId: preSelectedSiteId ?? null,
          assignedTo: "",
          lastMaintenanceDate: "",
          nextMaintenanceDate: "",
          notes: "",
          assetImages: [],
        },
  });
  const { setValue, getValues, watch } = form;
  const currentAssetImages = watch("assetImages", initialData?.images || []);
  const currentSerialNumbers = watch("serialNumbers", initialData?.serialNumbers || []);

  const handleAddSerialNumber = () => {
    const currentNumbers = getValues("serialNumbers");
    setValue("serialNumbers", [...currentNumbers, ""]);
  };

  const handleRemoveSerialNumber = (index: number) => {
    const currentNumbers = getValues("serialNumbers");
    setValue("serialNumbers", currentNumbers.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      // Map FormValues to the structure expected by the API
      const apiData: Partial<InsertAsset> & { images?: string[] } = {
        name: formData.name,
        assetId: formData.assetId, // Add the assetId field
        type: formData.type,
        category: formData.category,
        manufacturer: formData.manufacturer,
        model: formData.model,
        serialNumbers: formData.serialNumbers.filter(s => s.trim() !== ''),
        purchaseDate: formData.purchaseDate,
        purchasePrice: formData.purchasePrice ? String(formData.purchasePrice) : null,
        condition: formData.condition,
        location: formData.location,
        siteId: formData.siteId ? Number(formData.siteId) : null,
        assignedTo: formData.assignedTo,
        lastMaintenanceDate: formData.lastMaintenanceDate,
        nextMaintenanceDate: formData.nextMaintenanceDate,
        notes: formData.notes,
        images: formData.assetImages, // Use the final list from form state
      };

      if (isEdit && initialData) {
        const response = await apiRequest("PATCH", `/api/assets/${initialData.id}`, apiData);
        return response.json() as Promise<Asset>;
      } else {
        const response = await apiRequest("POST", "/api/assets", apiData);
        return response.json() as Promise<Asset>;
      }
    },
    onSuccess: (data: Asset) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      if (data?.id) {
         queryClient.invalidateQueries({ queryKey: [`/api/assets/${data.id}`] });
      }
      const siteId = data?.siteId ?? form.getValues("siteId");
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/assets`] });
      }
      toast({
        title: `Asset ${isEdit ? "updated" : "created"} successfully`,
        description: `The asset ${data?.name ?? ''} has been ${isEdit ? "updated" : "created"}.`,
      });
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} asset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleRemoveExistingImage = (imageUrlToRemove: string) => {
    const currentImages = getValues("assetImages") || [];
    setValue("assetImages", currentImages.filter(url => url !== imageUrlToRemove), { shouldValidate: true });
  };

  const handleRemoveNewFile = (fileToRemove: File) => {
    setSelectedFiles((prev) => prev.filter(file => file !== fileToRemove));
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsUploading(true);
    let finalImageUrls: string[] = getValues("assetImages") || []; // Start with images currently in form state

    try {
      // Upload NEW files if any
      if (selectedFiles.length > 0) {
        const newImageUrls = await uploadFiles(selectedFiles);
        finalImageUrls = [...finalImageUrls, ...newImageUrls]; // Add new URLs
        setSelectedFiles([]); // Clear selected files after upload
      }

      // Update the data object with the final list of images before mutation
      data.assetImages = finalImageUrls;
      mutation.mutate(data);

    } catch (error) {
      console.error("Image upload or form submission error:", error);
      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : "Could not save asset.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const typedForm = form as UseFormReturn<FormValues>;

  return (
    <Form {...typedForm}>
      <form onSubmit={typedForm.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={typedForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Lab Desktop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={typedForm.control}
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ASSET-123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={typedForm.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1"
                      {...field}
                      value={field.value ?? 1}
                      onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                    />
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
                  <FormLabel>Asset Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer, Printer, Desk" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={typedForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Teaching">Teaching</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={typedForm.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Site (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                    value={field.value ? String(field.value) : "none"}
                    disabled={sitesQuery.isLoading || Boolean(preSelectedSiteId)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assigned site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">-- None --</SelectItem>
                      {sitesQuery.isLoading ? (
                        <SelectItem value="loading" disabled>Loading sites...</SelectItem>
                      ) : sitesQuery.data?.map((site) => (
                        <SelectItem key={site.id} value={String(site.id)}>
                          {site.name} ({site.siteId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={typedForm.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                      <SelectItem value="NonFunctional">Non-functional</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
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
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dell, HP" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={typedForm.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Inspiron 3000" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Serial Numbers</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSerialNumber}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Serial Number
                </Button>
              </div>
              {currentSerialNumbers.map((_, index) => (
                <FormField
                  key={index}
                  control={typedForm.control}
                  name={`serialNumbers.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder={`Serial Number ${index + 1}`} {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveSerialNumber(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {currentSerialNumbers.length === 0 && (
                <p className="text-sm text-muted-foreground">No serial numbers added.</p>
              )}
            </div>
            <FormField
              control={typedForm.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={typedForm.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price (ZAR, Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={typedForm.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Lab, Room 101" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
            control={typedForm.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Name of person responsible" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={typedForm.control}
            name="lastMaintenanceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Maintenance Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Full Width Controls */}
        <div className="space-y-4">
           <FormField
            control={typedForm.control}
            name="nextMaintenanceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Maintenance Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={typedForm.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information about the asset"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload Area */}
          <div className="space-y-2">
            <FormLabel>Asset Images</FormLabel>
            <FormDescription>
              Upload images of the asset. Existing images can be removed.
            </FormDescription>

            {/* Display existing images with remove button */}
            {isEdit && currentAssetImages && currentAssetImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {currentAssetImages.map((url: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${url}`}
                      alt={`Asset image ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-100 flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleRemoveExistingImage(url)}
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Display selected new image previews with remove button */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-100 flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleRemoveNewFile(file)}
                      aria-label="Remove new image"
                    >
                      <X className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 mt-2">
              <div className="flex flex-col items-center justify-center space-y-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                 <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
               </div>
             </div>
           </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
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
              <>{isEdit ? "Update" : "Create"} Asset</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
