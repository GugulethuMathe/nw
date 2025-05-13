import React from 'react';
import { useLocation } from 'wouter';
import ProgramForm from '@/components/programs/ProgramForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type Program } from '@shared/schema';

export default function ProgramAddPage() {
  const [, setLocation] = useLocation();

  // Extract siteId from URL parameters
  const params = new URLSearchParams(window.location.search);
  const siteId = params.get('siteId') ? parseInt(params.get('siteId')!) : undefined;

  // Navigate to site detail or program detail page on success
  const handleSuccess = (newProgram?: Program) => {
    if (!newProgram) {
      // If cancelled, go back to site detail or programs list
      if (siteId) {
        setLocation(`/sites/${siteId}#programs`);
      } else {
        setLocation('/programs');
      }
      return;
    }

    // If successful, go to site detail or program detail
    if (siteId) {
      setLocation(`/sites/${siteId}#programs`); // Return to site detail's programs section
    } else {
      setLocation(`/programs/${newProgram.id}`); // Go to program detail if added from programs list
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" size="sm" onClick={() => handleSuccess()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to {siteId ? 'Site' : 'Programs List'}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Add New Program</CardTitle>
        </CardHeader>        <CardContent>
          <ProgramForm
            isEdit={false}
            onSuccess={handleSuccess}
            preSelectedSiteId={siteId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
