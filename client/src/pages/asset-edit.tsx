import React from 'react';
import { useParams, useLocation } from 'wouter'; // Import useLocation
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type Asset } from '@shared/schema';
import AssetForm from '@/components/assets/AssetForm'; // Import the form
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AssetEditPage() {
  const params = useParams();
  const [, setLocation] = useLocation(); // Get setLocation for navigation
  const assetId = params.id;

  const { data: asset, isLoading, error } = useQuery<Asset>({
    queryKey: [`/api/assets/${assetId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/assets/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch asset data for editing');
      }
      return response.json();
    },
    enabled: !!assetId, // Only run query if assetId exists
  });

  // Navigate back to the asset detail page on success or cancel
  const handleFinish = () => {
    setLocation(`/assets/${assetId}`);
  };

  if (!assetId) {
    return <div className="container p-4 text-red-600">Error: No asset ID provided.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" size="sm" onClick={handleFinish} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Asset Details
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit Asset: {isLoading ? 'Loading...' : asset?.name ?? 'Asset'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading asset data...</p>}
          {error && <p className="text-red-500">Error loading asset data: {error.message}</p>}
          {asset && (
            <AssetForm
              initialData={asset}
              isEdit={true}
              onSuccess={handleFinish} // Use the same handler for success
              onCancel={handleFinish} // Use the same handler for cancel
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
