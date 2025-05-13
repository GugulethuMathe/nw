import React from 'react';
import { useLocation } from 'wouter';
import StaffForm from '@/components/staff/StaffForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type Staff } from '@shared/schema';

export default function StaffAddPage() {
  const [, setLocation] = useLocation();

  // Extract siteId from URL parameters
  const params = new URLSearchParams(window.location.search);
  const siteId = params.get('siteId') ? parseInt(params.get('siteId')!) : undefined;
  // Navigate back to site detail page or staff detail page on success
  const handleSuccess = (newStaff?: Staff) => {
    // If cancelled (no staff provided), go back to previous page
    if (!newStaff) {
      if (siteId) {
        setLocation(`/sites/${siteId}`); // Return to site detail if we came from there
      } else {
        setLocation('/staff'); // Otherwise return to staff list
      }
      return;
    }

    // Handle successful staff creation
    if (siteId) {
      setLocation(`/sites/${siteId}#staff`); // Return to site detail's staff section
    } else {
      setLocation(`/staff/${newStaff.id}`); // Go to staff detail if added from staff list
    }
  };
  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" size="sm" onClick={() => handleSuccess()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to {siteId ? 'Site' : 'Staff List'}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Add New Staff Member</CardTitle>
        </CardHeader>
        <CardContent>
          <StaffForm
            isEdit={false}
            onSuccess={handleSuccess}
            preSelectedSiteId={siteId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
