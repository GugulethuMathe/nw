import React, { useState } from 'react'; // Import useState
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type District } from '@shared/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog components
import DistrictForm from '@/components/districts/DistrictForm'; // Import the form

// TODO: Implement Edit/Delete functionality

export default function DistrictsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // State for dialog

  const { data: districts, isLoading, error } = useQuery<District[]>({
    queryKey: ['/api/districts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/districts');
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      return response.json();
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Districts</h1>
        {/* Dialog for Adding District */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add District
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New District</DialogTitle>
              <DialogDescription>
                Fill in the details for the new district. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <DistrictForm
              onSuccess={() => setIsAddDialogOpen(false)} // Close dialog on success
              onCancel={() => setIsAddDialogOpen(false)} // Close dialog on cancel
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>District List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading districts...</p>}
          {error && <p className="text-red-500">Error loading districts: {error.message}</p>}
          {districts && districts.length > 0 ? (
            <ul className="space-y-2">
              {districts.map((district) => (
                <li key={district.id} className="p-2 border rounded flex justify-between items-center">
                  <span>{district.name} {district.region ? `(${district.region})` : ''}</span>
                  {/* TODO: Add Edit/Delete buttons */}
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && <p>No districts found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
