import React from 'react';
import { useLocation } from 'wouter';
import UserForm from '@/components/users/UserForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { type User } from '@shared/schema';

export default function UserAddPage() {
  const [, setLocation] = useLocation();

  const handleSuccess = (newUser?: User) => {
    // Navigate to a user list page or a user detail page if available
    // For now, let's navigate to a placeholder '/users' page
    if (newUser?.id) {
      setLocation(`/users/${newUser.id}`); // Or just /users if no detail page yet
    } else {
      setLocation('/users');
    }
  };

  const handleCancel = () => {
    setLocation('/users'); // Navigate back to users list
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" size="sm" onClick={handleCancel} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            isEdit={false}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}