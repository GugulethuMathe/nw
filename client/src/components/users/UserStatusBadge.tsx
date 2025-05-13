import React from 'react';

type Status = 'active' | 'inactive' | 'suspended';

interface UserStatusBadgeProps {
  status: Status;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
};

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default UserStatusBadge;