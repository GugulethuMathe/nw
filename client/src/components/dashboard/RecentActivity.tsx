import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const RecentActivity: React.FC = () => {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(4).fill(null).map((_, index) => (
              <div key={index} className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 mr-3 flex-shrink-0"></div>
                <div className="w-full">
                  <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to get the icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'site_visit':
        return 'fa-check-circle';
      case 'data_verification':
        return 'fa-clipboard-check';
      case 'photo_upload':
        return 'fa-camera';
      case 'staff_update':
        return 'fa-user-plus';
      default:
        return 'fa-history';
    }
  };

  // Function to get icon background class based on activity type
  const getIconClass = (type: string) => {
    switch (type) {
      case 'site_visit':
        return 'bg-primary-100 text-primary-500';
      case 'data_verification':
        return 'bg-success-light bg-opacity-20 text-success-light';
      case 'photo_upload':
        return 'bg-warning-light bg-opacity-20 text-warning-light';
      case 'staff_update':
        return 'bg-neutral-200 text-neutral-600';
      default:
        return 'bg-neutral-200 text-neutral-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`w-8 h-8 rounded-full ${getIconClass(activity.type)} flex items-center justify-center mr-3 mt-1`}>
                  <i className={`fas ${getActivityIcon(activity.type)}`}></i>
                </div>
                <div>
                  <p className="text-neutral-800 font-medium">{activity.description}</p>
                  {activity.performedBy && (
                    <p className="text-sm text-neutral-500">By User ID: {activity.performedBy}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Recently'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-neutral-500 py-4">
              <i className="fas fa-info-circle mb-2 text-2xl"></i>
              <p>No recent activities found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
