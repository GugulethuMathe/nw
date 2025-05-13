import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertStaffSchema, type Staff, type Site } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

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

// Extend the schema for additional validation
const extendedStaffSchema = insertStaffSchema.extend({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  position: z.string().min(2, { message: "Position is required" }),
  qualifications: z.array(z.string()).optional().default([]),
  startDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  employmentStatus: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof extendedStaffSchema>;

interface StaffFormProps {
  initialData?: Staff;
  onSuccess?: (staff?: Staff) => void;
  isEdit?: boolean;
  preSelectedSiteId?: number;
}

export default function StaffForm({ initialData, onSuccess, isEdit = false, preSelectedSiteId }: StaffFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sites for dropdown
  const sitesQuery = useQuery({
    queryKey: ["/api/sites"],
    select: (data: Site[]) => data,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(extendedStaffSchema),
    defaultValues: {
      staffId: initialData?.staffId || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      position: initialData?.position ?? "",
      department: initialData?.department ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      qualifications: initialData?.qualifications ?? [],
      siteId: initialData?.siteId || preSelectedSiteId || undefined,
      startDate: initialData?.startDate ?? "",
      contractEndDate: initialData?.contractEndDate ?? "",
      employmentStatus: initialData?.employmentStatus ?? "Permanent",
      notes: initialData?.notes ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await (isEdit && initialData 
        ? apiRequest("PATCH", `/api/staff/${initialData.id}`, data)
        : apiRequest("POST", "/api/staff", data));
      return response.json();
    },
    onSuccess: (data: Staff) => {
      // Invalidate staff queries
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      
      // If a site is selected, also invalidate that site's staff list
      const siteId = form.getValues("siteId");
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/staff`] });
      }
      
      toast({
        title: `Staff member ${isEdit ? "updated" : "created"} successfully`,
        description: `The staff member has been ${isEdit ? "updated" : "created"}.`,
      });
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      if (!isEdit) {
        form.reset();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} staff member: ${error.message}`,
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
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., STAFF-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lecturer, Administrator" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ICT, Administration" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="PartTime">Part Time</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
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
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Site</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    defaultValue={field.value ? String(field.value) : undefined}
                    disabled={sitesQuery.isLoading || Boolean(preSelectedSiteId)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assigned site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sitesQuery.isLoading ? (
                        <SelectItem value="loading">Loading sites...</SelectItem>
                      ) : sitesQuery.data?.map((site) => (
                        <SelectItem key={site.id} value={String(site.id)}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., staff@cetcollege.edu.za" 
                      {...field}
                      value={field.value ?? ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., +27 12 345 6789" 
                      {...field}
                      value={field.value ?? ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract End Date</FormLabel>
                  <FormControl>
                    <Input type="date" value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qualifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualifications</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., B.Ed, NCert" 
                      {...field}
                      value={Array.isArray(field.value) ? field.value.join(", ") : field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? value.split(",").map(item => item.trim()) : []);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Full Width Controls */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional information about the staff member"
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
              <>{isEdit ? "Update" : "Create"} Staff Member</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}