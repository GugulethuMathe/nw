import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle, 
  Camera, 
  FileText, 
  User, 
  Calendar, 
  Clock,
  Building,
  Lightbulb,
  Eye,
  Trash2
} from "lucide-react";

interface User {
  id: number;
  username: string;
}

interface ActivityListProps {
  siteId: number;
  filter?: string; // Optional filter for activity type
  onActionComplete?: () => void; // Callback for when an action is completed
}

const ActivityList: React.FC<ActivityListProps> = ({ siteId, filter, onActionComplete }) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [viewActivity, setViewActivity] = useState<Activity | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Add query for users with proper typing
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: [`/api/sites/${siteId}/activities`],
  });

  // Function to get username from user ID
  const getUserName = (userId: number | null) => {
    if (!userId || !users) return "Unknown User";
    const user = users.find(u => u.id === userId);
    return user ? user.username : "Unknown User";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error loading activities: {error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardList className="mx-auto h-12 w-12 text-neutral-300" />
        <h3 className="mt-2 text-lg font-medium text-neutral-700">No Activities</h3>
        <p className="text-neutral-500">There are no recorded activities for this site.</p>
      </div>
    );
  }

  // Filter activities if a filter is provided
  const filteredActivities = filter 
    ? activities.filter(activity => activity.type === filter)
    : activities;

  if (filteredActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardList className="mx-auto h-12 w-12 text-neutral-300" />
        <h3 className="mt-2 text-lg font-medium text-neutral-700">No Matching Activities</h3>
        <p className="text-neutral-500">There are no activities matching the selected filter.</p>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "site_visit":
        return <CheckCircle className="h-5 w-5 text-success-light" />;
      case "data_verification":
        return <CheckCircle className="h-5 w-5 text-primary-500" />;
      case "photo_upload":
        return <Camera className="h-5 w-5 text-primary-500" />;
      case "staff_update":
        return <User className="h-5 w-5 text-primary-500" />;
      case "site_creation":
        return <Building className="h-5 w-5 text-primary-500" />;
      case "site_update":
        return <Building className="h-5 w-5 text-success-light" />;
      case "recommendation":
        return <Lightbulb className="h-5 w-5 text-warning-light" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "site_visit":
        return <Badge variant="outline" className="bg-success-light bg-opacity-10 text-success-light border-success-light">Visit</Badge>;
      case "data_verification":
        return <Badge variant="outline" className="bg-primary-100 text-primary-500 border-primary-200">Verification</Badge>;
      case "photo_upload":
        return <Badge variant="outline" className="bg-primary-100 text-primary-500 border-primary-200">Photos</Badge>;
      case "staff_update":
        return <Badge variant="outline" className="bg-primary-100 text-primary-500 border-primary-200">Staff</Badge>;
      case "site_creation":
        return <Badge variant="outline" className="bg-primary-100 text-primary-500 border-primary-200">Creation</Badge>;
      case "site_update":
        return <Badge variant="outline" className="bg-success-light bg-opacity-10 text-success-light border-success-light">Update</Badge>;
      case "recommendation":
        return <Badge variant="outline" className="bg-warning-light bg-opacity-10 text-warning-light border-warning-light">Recommendation</Badge>;
      default:
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-500 border-neutral-200">Activity</Badge>;
    }
  };

  // Function to update recommendation status
  const handleUpdateRecommendationStatus = async (activityId: number, status: string) => {
    setIsUpdating(activityId);
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            status: status
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update recommendation status");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/activities`] });
      
      toast({
        title: `Recommendation ${status}`,
        description: `The recommendation has been marked as ${status.toLowerCase()}.`,
      });
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error("Error updating recommendation status:", error);
      toast({
        title: "Error",
        description: "Failed to update recommendation status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Function to handle viewing a recommendation
  const handleViewRecommendation = (activity: Activity) => {
    setViewActivity(activity);
    setIsViewDialogOpen(true);
  };

  // Function to handle removing a recommendation
  const handleRemoveRecommendation = async (activityId: number) => {
    if (!confirm("Are you sure you want to remove this recommendation? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(activityId);
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove recommendation");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${siteId}/activities`] });
      
      toast({
        title: "Recommendation Removed",
        description: "The recommendation has been permanently removed.",
      });
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error("Error removing recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to remove recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Recommendation View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recommendation Details</DialogTitle>
            <DialogDescription>
              View detailed information about this recommendation.
            </DialogDescription>
          </DialogHeader>
          
          {viewActivity && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-warning-light" />
                <h3 className="text-lg font-medium">{viewActivity.description}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-500">Created By</p>
                    <p className="font-medium">{getUserName(viewActivity.performedBy)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Created On</p>
                    <p className="font-medium">{formatDate(viewActivity.timestamp)}</p>
                  </div>
                  
                  {viewActivity.metadata?.priority && (
                    <div>
                      <p className="text-sm text-neutral-500">Priority</p>
                      <p className="font-medium">{viewActivity.metadata.priority}</p>
                    </div>
                  )}
                  
                  {viewActivity.metadata?.category && (
                    <div>
                      <p className="text-sm text-neutral-500">Category</p>
                      <p className="font-medium">{viewActivity.metadata.category}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {viewActivity.metadata?.status && (
                    <div>
                      <p className="text-sm text-neutral-500">Status</p>
                      <Badge variant="outline" className={`
                        ${viewActivity.metadata.status === 'Completed' ? 'bg-success-light bg-opacity-10 text-success-light border-success-light' : 
                          viewActivity.metadata.status === 'Discarded' ? 'bg-neutral-100 text-neutral-500 border-neutral-200' :
                          'bg-primary-100 text-primary-500 border-primary-200'}
                      `}>
                        {viewActivity.metadata.status}
                      </Badge>
                    </div>
                  )}
                  
                  {viewActivity.metadata?.estimatedCost && (
                    <div>
                      <p className="text-sm text-neutral-500">Estimated Cost</p>
                      <p className="font-medium">R {viewActivity.metadata.estimatedCost}</p>
                    </div>
                  )}
                  
                  {viewActivity.metadata?.timeframe && (
                    <div>
                      <p className="text-sm text-neutral-500">Timeframe</p>
                      <p className="font-medium">{viewActivity.metadata.timeframe}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {viewActivity.metadata?.details && (
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Detailed Description</p>
                  <div className="bg-neutral-50 p-3 rounded-md whitespace-pre-wrap">
                    {viewActivity.metadata.details}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {filteredActivities.map((activity) => (
        <Card key={activity.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {getActivityBadge(activity.type)}
                  <span className="text-sm text-neutral-500 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDate(activity.timestamp)}
                  </span>
                  <span className="text-sm text-neutral-500 flex items-center">
                    <User className="h-3.5 w-3.5 mr-1" />
                    {getUserName(activity.performedBy)}
                  </span>
                </div>
                <p className="text-neutral-800">{activity.description}</p>
                
                {/* Display recommendation metadata if available */}
                {activity.type === "recommendation" && activity.metadata && (
                  <div className="mt-2 bg-neutral-50 p-2 rounded-md">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {activity.metadata.priority && (
                        <Badge variant="outline" className={`
                          ${activity.metadata.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' : 
                            activity.metadata.priority === 'High' ? 'bg-warning-light bg-opacity-10 text-warning-light border-warning-light' :
                            activity.metadata.priority === 'Medium' ? 'bg-primary-100 text-primary-500 border-primary-200' :
                            'bg-neutral-100 text-neutral-500 border-neutral-200'}
                        `}>
                          Priority: {activity.metadata.priority}
                        </Badge>
                      )}
                      {activity.metadata.category && (
                        <Badge variant="outline" className="bg-neutral-100 text-neutral-500 border-neutral-200">
                          {activity.metadata.category}
                        </Badge>
                      )}
                      {activity.metadata.status && (
                        <Badge variant="outline" className={`
                          ${activity.metadata.status === 'Completed' ? 'bg-success-light bg-opacity-10 text-success-light border-success-light' : 
                            activity.metadata.status === 'Discarded' ? 'bg-neutral-100 text-neutral-500 border-neutral-200' :
                            'bg-primary-100 text-primary-500 border-primary-200'}
                        `}>
                          {activity.metadata.status}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Action buttons for recommendations */}
                    {activity.type === "recommendation" && (
                      <div className="flex justify-end gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-primary-500 border-primary-200 hover:bg-primary-50"
                          onClick={() => handleViewRecommendation(activity)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        
                        {(!activity.metadata?.status || 
                          (activity.metadata.status !== 'Completed' && 
                           activity.metadata.status !== 'Discarded')) && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-success-light border-success-light hover:bg-success-light hover:text-white"
                              onClick={() => handleUpdateRecommendationStatus(activity.id, 'Completed')}
                              disabled={isUpdating === activity.id}
                            >
                              {isUpdating === activity.id ? "Updating..." : "Mark as Completed"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-neutral-500 border-neutral-300 hover:bg-neutral-200"
                              onClick={() => handleUpdateRecommendationStatus(activity.id, 'Discarded')}
                              disabled={isUpdating === activity.id}
                            >
                              {isUpdating === activity.id ? "Updating..." : "Discard"}
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleRemoveRecommendation(activity.id)}
                          disabled={isDeleting === activity.id}
                        >
                          {isDeleting === activity.id ? (
                            <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityList;
