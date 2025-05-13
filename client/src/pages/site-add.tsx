import React from 'react';
import { useLocation } from 'wouter'; // Import useLocation for navigation
import SiteForm from '@/components/sites/SiteForm'; // Import the form
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type Site } from '@shared/schema'; // Import Site type for onSuccess data

export default function SiteAddPage() {
  const [, setLocation] = useLocation(); // Get setLocation for navigation

  // Navigate to the new site's detail page on success
  const handleSuccess = (newSite?: Site) => {
    if (newSite?.id) {
      setLocation(`/sites/${newSite.id}`);
    } else {
      setLocation('/sites'); // Fallback to sites list if ID isn't returned
    }
  };

  // Navigate back to the sites list on cancel
  const handleCancel = () => {
    setLocation('/sites');
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" size="sm" onClick={handleCancel} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sites List
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Add New Site</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteForm
            isEdit={false} // Explicitly set isEdit to false
            onSuccess={handleSuccess} // Pass success handler for navigation
            onCancel={handleCancel} // Pass cancel handler for navigation
          />
        </CardContent>
      </Card>
    </div>
  );
}
