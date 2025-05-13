import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type User } from '@shared/schema';
import UserForm from '@/components/users/UserForm';
import UserActivityLog from '@/components/users/UserActivityLog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function UserEditPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const userId = params.id;

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data for editing');
      }
      return response.json();
    },
    enabled: !!userId, // Only run query if userId exists
  });

  const handleSuccess = (updatedUser?: User) => {
    // Create activity log for the update
    if (updatedUser) {
      apiRequest('POST', `/api/users/${updatedUser.id}/activities`, {
        type: 'user_update',
        description: 'User profile updated',
        metadata: {
          updatedFields: Object.keys(updatedUser).filter(key => key !== 'password')
        }
      }).catch(console.error);
    }
    
    setLocation(updatedUser?.id ? `/users/${updatedUser.id}` : '/users'); // Navigate back to user list or detail page
  };

  const handleCancel = () => {
    setLocation(userId ? `/users/${userId}` : '/users'); // Navigate back to user detail or list page
  };

  if (!userId) {
    return <div className="container p-4 text-red-600">Error: No user ID provided.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" size="sm" onClick={handleCancel} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Details/List
      </Button>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Edit User: {isLoading ? 'Loading...' : user?.name ?? 'User'}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading user data...</p>}
              {error && <p className="text-red-500">Error loading user data: {error.message}</p>}
              {user && (
                <UserForm
                  initialData={user}
                  isEdit={true}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {user && (
            <UserActivityLog userId={parseInt(userId)} />
          )}
        </div>
      </div>
    </div>
  );
}