'use client';

import React from 'react';

interface DisasterLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

interface MapComponentProps {
  disasters?: DisasterLocation[];
  resources?: DisasterLocation[];
}

export const MapComponent: React.FC<MapComponentProps> = ({
  disasters = [
    {
      id: '1',
      lat: 40.7128,
      lng: -74.006,
      title: 'Downtown Flooding',
      severity: 'critical',
      description: 'Severe flooding in downtown area',
    },
    {
      id: '2',
      lat: 40.758,
      lng: -73.9855,
      title: 'Medical Emergency Hub',
      severity: 'high',
      description: 'Multiple casualties reported',
    },
  ],
  resources = [
    {
      id: 'r1',
      lat: 40.7489,
      lng: -73.968,
      title: 'Hospital A',
      severity: 'high',
      description: '200 beds available',
    },
  ],
}) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden neon-border bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h2 className="text-3xl font-bold gradient-text">Interactive Disaster Map</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="neon-card">
            <div className="text-3xl font-bold text-red-400">{disasters.length}</div>
            <div className="text-xs text-gray-400 mt-2">Active Disaster Zones</div>
            <div className="text-xs text-gray-500 mt-1">
              {disasters.map(d => d.title).join(', ')}
            </div>
          </div>
          
          <div className="neon-card">
            <div className="text-3xl font-bold text-green-400">{resources.length}</div>
            <div className="text-xs text-gray-400 mt-2">Available Resources</div>
            <div className="text-xs text-gray-500 mt-1">
              {resources.map(r => r.title).join(', ')}
            </div>
          </div>
        </div>

        <div className="space-y-3 max-w-xs">
          <div className="text-cyan-400 text-sm">Current Disaster Locations:</div>
          {disasters.map((d) => (
            <div key={d.id} className="text-xs text-gray-300 neon-card">
              <span className="font-semibold text-cyan-300">{d.title}</span>
              <div className="text-gray-500 text-xs mt-1">{d.description}</div>
              <div className={`text-xs mt-1 ${
                d.severity === 'critical' ? 'text-red-400' : 
                d.severity === 'high' ? 'text-orange-400' : 
                'text-yellow-400'
              }`}>
                Severity: {d.severity.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        <p className="text-cyan-400 text-xs italic mt-4 text-gray-500">
          📍 Interactive map view. For production, integrate with React Leaflet
        </p>
      </div>
    </div>
  );
};

export default React.memo(MapComponent);
