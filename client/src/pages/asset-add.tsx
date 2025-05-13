import React from 'react';
import { useLocation } from 'wouter'; // Import useLocation for navigation
import AssetForm from '@/components/assets/AssetForm'; // Import the form
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type Asset } from '@shared/schema'; // Import Asset type for onSuccess data
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import React Query hooks

export default function AssetAddPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Extract siteId from URL parameters
  const params = new URLSearchParams(window.location.search);
  const siteId = params.get('siteId') ? parseInt(params.get('siteId')!) : undefined;
  
  // Disable any automatic query for "/api/assets/add" that might be triggered
  React.useEffect(() => {
    // Ensure that any query with key "/api/assets/add" is marked as disabled
    queryClient.setQueryDefaults(["/api/assets/add"], {
      enabled: false
    });
    
    return () => {
      // Clean up by removing our custom defaults when component unmounts
      queryClient.removeQueries({ queryKey: ["/api/assets/add"] });
    };
  }, [queryClient]);

  // Navigate to site detail or asset detail page on success
  const handleSuccess = (newAsset?: Asset) => {
    if (!newAsset) {
      // If cancelled, go back to site detail or assets list
      if (siteId) {
        setLocation(`/sites/${siteId}#assets`);
      } else {
        setLocation('/assets');
      }
      return;
    }

    // If successful, go to site detail page or asset detail
    if (siteId) {
      setLocation(`/sites/${siteId}#assets`); // Return to site detail's assets section
    } else {
      setLocation(`/assets/${newAsset.id}`); // Go to asset detail if added from assets list
    }
  };

  return (
    <div className="container mx-auto p-4">      <Button variant="outline" size="sm" onClick={() => handleSuccess()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to {siteId ? 'Site' : 'Assets List'}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Add New Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm
            isEdit={false}
            onSuccess={handleSuccess}
            preSelectedSiteId={siteId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
