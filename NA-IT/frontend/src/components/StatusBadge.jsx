import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Issued':
        return 'bg-yellow-100 text-yellow-800';
      case 'Returned':
        return 'bg-blue-100 text-blue-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge; 