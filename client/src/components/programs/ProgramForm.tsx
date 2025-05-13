import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertProgramSchema, type Program, type Site } from "@shared/schema";
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
const extendedProgramSchema = insertProgramSchema.extend({
  name: z.string().min(3, { message: "Program name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).optional(),
});

type FormValues = z.infer<typeof extendedProgramSchema>;

interface ProgramFormProps {
  initialData?: Program;
  onSuccess?: () => void;
  isEdit?: boolean;
  preSelectedSiteId?: number;
}

export default function ProgramForm({ initialData, onSuccess, isEdit = false, preSelectedSiteId }: ProgramFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sites for dropdown
  const sitesQuery = useQuery({
    queryKey: ["/api/sites"],
    select: (data: Site[]) => data,
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(extendedProgramSchema),
    defaultValues: initialData ? {
      programId: initialData.programId,
      name: initialData.name,
      category: initialData.category,
      description: initialData.description || undefined,
      enrollmentCount: initialData.enrollmentCount || undefined,
      startDate: initialData.startDate || undefined,
      endDate: initialData.endDate || undefined,
      status: initialData.status,
      notes: initialData.notes || undefined,
      siteId: initialData.siteId || undefined,
    } : {
      programId: "",
      name: "",
      category: "Basic Education",
      description: undefined,
      enrollmentCount: undefined,
      startDate: undefined,
      endDate: undefined,
      status: "Active",
      notes: undefined,
      siteId: preSelectedSiteId || undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest(
        isEdit && initialData ? 'PATCH' : 'POST',
        isEdit && initialData ? `/api/programs/${initialData.id}` : '/api/programs',
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      
      const siteId = form.getValues("siteId");
      if (siteId) {
        queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/programs`] });
      }
      
      toast({
        title: `Program ${isEdit ? "updated" : "created"} successfully`,
        description: `The program has been ${isEdit ? "updated" : "created"}.`,
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
        description: `Failed to ${isEdit ? "update" : "create"} program: ${error.message}`,
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
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PROG-001" {...field} />
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
                  <FormLabel>Program Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Adult Basic Education" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Basic Education">Basic Education</SelectItem>
                      <SelectItem value="Vocational">Vocational</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
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
              name="enrollmentCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Enrollment</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed description of the program"
                    className="resize-none min-h-[100px]"
                    {...field}
                    value={field.value ?? ''} 
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
                    placeholder="Any additional information about the program"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ''} 
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
              <>{isEdit ? "Update" : "Create"} Program</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}