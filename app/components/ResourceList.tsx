'use client';

import React, { useMemo, useCallback } from 'react';
import { Package, MapPin, Truck, Zap } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'medical' | 'food' | 'water' | 'shelter' | 'transport' | 'fuel';
  quantity: number;
  unit: string;
  location: string;
  status: 'available' | 'deployed' | 'depleted';
  lastUpdated: Date;
}

interface ResourceListProps {
  resources?: Resource[];
  onSelectResource?: (resource: Resource) => void;
}

const ResourceCard: React.FC<{
  resource: Resource;
  onSelect: (resource: Resource) => void;
}> = ({ resource, onSelect }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return '🏥';
      case 'food':
        return '🍕';
      case 'water':
        return '💧';
      case 'shelter':
        return '🏠';
      case 'transport':
        return '🚗';
      case 'fuel':
        return '⛽';
      default:
        return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-400 px-2 py-1 rounded';
      case 'deployed':
        return 'text-blue-400 px-2 py-1 rounded';
      case 'depleted':
        return 'text-red-400 px-2 py-1 rounded';
      default:
        return 'text-gray-400 px-2 py-1 rounded';
    }
  };

  return (
    <button
      onClick={() => onSelect(resource)}
      className="neon-card w-full text-left hover:scale-105 transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(resource.type)}</span>
          <div>
            <h3 className="font-semibold text-cyan-300">{resource.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(resource.status)}`}>
          {resource.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-cyan-400">
            {resource.quantity} {resource.unit}
          </span>
          <Zap size={14} className="text-purple-400" />
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-cyan-400" />
          <span className="truncate">{resource.location}</span>
        </div>
        <div className="text-gray-600">
          Updated: {resource.lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </button>
  );
};

const MemoizedResourceCard = React.memo(ResourceCard);

export const ResourceList: React.FC<ResourceListProps> = ({
  resources = [
    {
      id: 'r1',
      name: 'Oxygen Tanks',
      type: 'medical',
      quantity: 150,
      unit: 'units',
      location: 'Medical Warehouse A',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: 'r2',
      name: 'Emergency Food Kits',
      type: 'food',
      quantity: 500,
      unit: 'boxes',
      location: 'Distribution Center',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: 'r3',
      name: 'Water Tanks',
      type: 'water',
      quantity: 50,
      unit: 'tanks',
      location: 'Central Supply Point',
      status: 'deployed',
      lastUpdated: new Date(Date.now() - 300000),
    },
    {
      id: 'r4',
      name: 'Emergency Vehicles',
      type: 'transport',
      quantity: 20,
      unit: 'vehicles',
      location: 'Fleet Station',
      status: 'available',
      lastUpdated: new Date(),
    },
  ],
  onSelectResource = () => {},
}) => {
  // Memoize resources by status
  const groupedResources = useMemo(() => {
    const groups: Record<string, Resource[]> = {
      available: [],
      deployed: [],
      depleted: [],
    };

    resources.forEach((resource) => {
      groups[resource.status].push(resource);
    });

    return [
      ...groups.available,
      ...groups.deployed,
      ...groups.depleted,
    ];
  }, [resources]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Package size={20} className="text-cyan-400" />
        <h2 className="text-lg font-bold text-cyan-400">Available Resources</h2>
        <span className="ml-auto text-xs text-cyan-500 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 255, 255, 0.2)' }}>
          {groupedResources.length}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {groupedResources.map((resource) => (
          <MemoizedResourceCard
            key={resource.id}
            resource={resource}
            onSelect={onSelectResource}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(ResourceList);
