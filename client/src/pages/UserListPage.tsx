import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { type User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Ban, Play, Pause } from 'lucide-react';
import UserStatusBadge from '@/components/users/UserStatusBadge';
import { useToast } from '@/hooks/use-toast';

const deleteUserApi = async (userId: number) => {
  const response = await apiRequest('DELETE', `/api/users/${userId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete user and parse error response.' }));
    throw new Error(errorData.message || 'Failed to delete user');
  }
};

const updateUserStatus = async (userId: number, status: 'active' | 'inactive' | 'suspended') => {
  const response = await apiRequest('PATCH', `/api/users/${userId}`, { status });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update user status');
  }
  return response.json();
};

export default function UserListPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: number, status: 'active' | 'inactive' | 'suspended' }) => 
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  const handleStatusChange = async (userId: number, currentStatus: string) => {
    let newStatus: 'active' | 'inactive' | 'suspended';
    
    switch (currentStatus) {
      case 'active':
        if (window.confirm('Are you sure you want to deactivate this user?')) {
          newStatus = 'inactive';
        } else {
          return;
        }
        break;
      case 'inactive':
        if (window.confirm('Are you sure you want to activate this user?')) {
          newStatus = 'active';
        } else {
          return;
        }
        break;
      case 'suspended':
        if (window.confirm('Are you sure you want to reactivate this user?')) {
          newStatus = 'active';
        } else {
          return;
        }
        break;
      default:
        return;
    }

    statusMutation.mutate({ userId, status: newStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Pause className="h-4 w-4" />;
      case 'inactive':
        return <Play className="h-4 w-4" />;
      case 'suspended':
        return <Play className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusTooltip = (status: string) => {
    switch (status) {
      case 'active':
        return 'Deactivate User';
      case 'inactive':
      case 'suspended':
        return 'Activate User';
      default:
        return '';
    }
  };

  if (isLoading) return <div className="container p-4">Loading users...</div>;
  if (error) return <div className="container p-4 text-red-500">Error fetching users: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <Link href="/users/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <UserStatusBadge status={(user.status || 'active') as 'active' | 'inactive' | 'suspended'} />
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Link href={`/users/${user.id}/edit`}>
                        <Button variant="outline" size="sm" title="Edit User">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(user.id, user.status || 'active')}
                        title={getStatusTooltip(user.status || 'active')}
                      >
                        {getStatusIcon(user.status || 'active')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to suspend this user?')) {
                            statusMutation.mutate({ userId: user.id, status: 'suspended' });
                          }
                        }}
                        title="Suspend User"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(user.id)}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}