import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { insertDistrictSchema, type District, type InsertDistrict } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog'; // Import DialogFooter

// Use the insertDistrictSchema directly for form validation
const formSchema = insertDistrictSchema;
type FormValues = z.infer<typeof formSchema>;

interface DistrictFormProps {
  initialData?: District;
  onSuccess?: () => void;
  onCancel?: () => void; // Add onCancel prop
  isEdit?: boolean;
}

export default function DistrictForm({
  initialData,
  onSuccess,
  onCancel, // Add onCancel
  isEdit = false,
}: DistrictFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      region: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      // No complex mapping needed here as FormValues matches InsertDistrict
      const apiData: InsertDistrict = formData;

      const url = isEdit && initialData ? `/api/districts/${initialData.id}` : '/api/districts';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await apiRequest(method, url, apiData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/districts'] });
      toast({
        title: `District ${isEdit ? 'updated' : 'created'} successfully`,
      });
      if (onSuccess) {
        onSuccess();
      }
      if (!isEdit) {
        form.reset(); // Reset form only on create
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} district: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dr Kenneth Kaunda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., North West" {...field} value={field.value ?? ''} />
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
              <FormLabel>Contact Person (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Name of contact" {...field} value={field.value ?? ''} />
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
              <FormLabel>Contact Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., manager@district.com" {...field} value={field.value ?? ''} />
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
              <FormLabel>Contact Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., +27 18 111 2222" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Use DialogFooter for buttons */}
        <DialogFooter>
           <Button
            type="button"
            variant="outline"
            onClick={onCancel} // Call onCancel when cancel button is clicked
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update District' : 'Create District'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
