import React from 'react';
import { useParams, useLocation } from 'wouter'; // Import useLocation
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type Site } from '@shared/schema';
import SiteForm from '@/components/sites/SiteForm'; // Import the form
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SiteEditPage() {
  const params = useParams();
  const [, setLocation] = useLocation(); // Get setLocation for navigation
  const siteId = params.id;

  const { data: site, isLoading, error } = useQuery<Site>({
    queryKey: [`/api/sites/${siteId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/sites/${siteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch site data for editing');
      }
      return response.json();
    },
    enabled: !!siteId, // Only run query if siteId exists
  });

  const handleSuccess = () => {
    setLocation(`/sites/${siteId}`); // Navigate back to detail page on success
  };

  const handleCancel = () => {
    setLocation(`/sites/${siteId}`); // Navigate back to detail page on cancel
  };

  if (!siteId) {
    return <div className="container p-4 text-red-600">Error: No site ID provided.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" size="sm" onClick={handleCancel} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Site Details
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Site: {isLoading ? 'Loading...' : site?.name ?? 'Site'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading site data...</p>}
          {error && <p className="text-red-500">Error loading site data: {error.message}</p>}
          {site && (
            <SiteForm
              initialData={site}
              isEdit={true}
              onSuccess={handleSuccess}
              onCancel={handleCancel} // Pass cancel handler
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
