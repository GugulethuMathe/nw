import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { type User, insertUserSchema } from '@shared/schema';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ROLES = ['Admin', 'Project Manager', 'Data Analyst', 'Field Assessor', 'Viewer'] as const;
const STATUSES = ['active', 'inactive', 'suspended'] as const;

const userFormSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
  status: z.enum(STATUSES).default('active'),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: User;
  isEdit: boolean;
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

const roleDescriptions = {
  'Admin': 'Full system access and user management',
  'Project Manager': 'Manage sites, staff, and view reports',
  'Data Analyst': 'Access to data analysis and reporting features',
  'Field Assessor': 'Perform site assessments and update site data',
  'Viewer': 'View-only access to site information'
};

const UserForm: React.FC<UserFormProps> = ({ initialData, isEdit, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<typeof ROLES[number]>(
    initialData?.role as typeof ROLES[number] || 'Viewer'
  );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData
      ? {
          username: initialData.username,
          name: initialData.name,
          email: initialData.email || '',
          phone: initialData.phone || '',
          role: initialData.role as typeof ROLES[number],
          status: (initialData.status as typeof STATUSES[number]) || 'active',
          password: '', // Password should be re-entered for edits or left blank if not changing
        }
      : {
          username: '',
          name: '',
          email: '',
          phone: '',
          role: 'Viewer', // Default role
          status: 'active',
          password: '',
        },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        username: initialData.username,
        name: initialData.name,
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role as typeof ROLES[number],
        status: (initialData.status as typeof STATUSES[number]) || 'active',
        password: '', // Clear password on initial load for edit
      });
      setSelectedRole(initialData.role as typeof ROLES[number]);
    }
  }, [initialData, form]);

  const onSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const url = isEdit ? `/api/users/${initialData?.id}` : '/api/users';
      
      // For PATCH, only send changed password if provided
      const payload = { ...values };
      if (isEdit && !values.password) {
        delete payload.password; // Don't send empty password string
      }

      const response = await apiRequest(method, url, payload);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }

      const result = await response.json();
      onSuccess(result); // API now directly returns the user object (without password)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <Label htmlFor="name">Full Name*</Label>
        <Input id="name" {...form.register('name')} />
        {form.formState.errors.name && 
          <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
        }
      </div>

      <div>
        <Label htmlFor="username">Username*</Label>
        <Input id="username" {...form.register('username')} />
        {form.formState.errors.username && 
          <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
        }
      </div>

      <div>
        <Label htmlFor="email">Email*</Label>
        <Input id="email" type="email" {...form.register('email')} />
        {form.formState.errors.email && 
          <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
        }
      </div>

      <div>
        <Label htmlFor="password">
          Password* {isEdit && "(leave blank to keep current)"}
        </Label>
        <Input 
          id="password" 
          type="password" 
          {...form.register('password')}
          placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
        />
        {form.formState.errors.password && 
          <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
        }
      </div>

      <div>
        <Label htmlFor="role">Role*</Label>
        <Select 
          onValueChange={(value) => {
            form.setValue('role', value as typeof ROLES[number]);
            setSelectedRole(value as typeof ROLES[number]);
          }} 
          defaultValue={form.getValues('role')}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRole && (
          <p className="mt-1 text-sm text-gray-500">
            {roleDescriptions[selectedRole]}
          </p>
        )}
        {form.formState.errors.role && 
          <p className="text-red-500 text-sm">{form.formState.errors.role.message}</p>
        }
      </div>

      {isEdit && (
        <div>
          <Label htmlFor="status">Status*</Label>
          <Select 
            onValueChange={(value) => form.setValue('status', value as typeof STATUSES[number])} 
            defaultValue={form.getValues('status')}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(status => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.status && 
            <p className="text-red-500 text-sm">{form.formState.errors.status.message}</p>
          }
        </div>
      )}

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...form.register('phone')} />
        {form.formState.errors.phone && 
          <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
        }
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <i className="fas fa-spinner fa-spin"></i>
              {isEdit ? 'Saving...' : 'Creating...'}
            </span>
          ) : (
            isEdit ? 'Save Changes' : 'Create User'
          )}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;