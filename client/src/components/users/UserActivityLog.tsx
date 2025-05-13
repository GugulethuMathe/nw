import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type Activity } from '@shared/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface UserActivityLogProps {
  userId: number;
}

const UserActivityLog: React.FC<UserActivityLogProps> = ({ userId }) => {
  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: [`/api/users/${userId}/activities`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/users/${userId}/activities`);
      if (!response.ok) {
        throw new Error('Failed to fetch user activities');
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading activity log...</div>;
  if (error) return <div className="text-red-500">Error loading activity log</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="border-b pb-2 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {activity.timestamp ? format(new Date(activity.timestamp), 'PPp') : 'N/A'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No activity recorded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserActivityLog;