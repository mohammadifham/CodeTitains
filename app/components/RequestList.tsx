'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, Clock, MapPin, User } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  location: string;
  requester: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface RequestListProps {
  requests?: Request[];
  onSelectRequest?: (request: Request) => void;
}

const RequestCard: React.FC<{
  request: Request;
  onSelect: (request: Request) => void;
}> = ({ request, onSelect }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 px-2 py-1 rounded';
      case 'high':
        return 'text-orange-400 px-2 py-1 rounded';
      case 'medium':
        return 'text-yellow-400 px-2 py-1 rounded';
      default:
        return 'text-green-400 px-2 py-1 rounded';
    }
  };

  return (
    <button
      onClick={() => onSelect(request)}
      className="neon-card w-full text-left hover:scale-105 transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-cyan-300 flex-1">{request.title}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(request.priority)}`}>
          {request.priority.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-cyan-400" />
          <span className="truncate">{request.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} className="text-cyan-400" />
          <span>{request.requester}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" />
          <span>{request.timestamp.toLocaleTimeString()}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3 line-clamp-2">{request.description}</p>
    </button>
  );
};

const MemoizedRequestCard = React.memo(RequestCard);

export const RequestList: React.FC<RequestListProps> = ({
  requests = [
    {
      id: '1',
      title: 'Medical Supplies Needed',
      location: 'Downtown Hospital',
      requester: 'Dr. Smith',
      priority: 'critical',
      timestamp: new Date(),
      description: 'Urgent need for oxygen tanks and bandages',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Water Distribution',
      location: 'East District',
      requester: 'Emergency Team',
      priority: 'high',
      timestamp: new Date(Date.now() - 600000),
      description: 'Safe drinking water needed for 500+ people',
      status: 'in-progress',
    },
    {
      id: '3',
      title: 'Shelter Setup',
      location: 'Central Park',
      requester: 'Civil Protection',
      priority: 'high',
      timestamp: new Date(Date.now() - 1200000),
      description: 'Temporary shelters required for displaced families',
      status: 'pending',
    },
  ],
  onSelectRequest = () => {},
}) => {
  // Memoize sorted requests to prevent unnecessary re-renders
  const sortedRequests = useMemo(() => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...requests].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
  }, [requests]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-orange-400" />
        <h2 className="text-lg font-bold text-cyan-400">Active Requests</h2>
        <span className="ml-auto text-xs text-cyan-500 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 255, 255, 0.2)' }}>
          {sortedRequests.length}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {sortedRequests.map((request) => (
          <MemoizedRequestCard
            key={request.id}
            request={request}
            onSelect={onSelectRequest}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(RequestList);
