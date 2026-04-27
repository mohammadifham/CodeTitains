'use client';

import 'leaflet/dist/leaflet.css';
import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

interface IncidentRecord {
  id: number;
  title: string;
  location: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

interface ResourceRecord {
  id: number;
  name: string;
  category: 'medical' | 'rescue' | 'food' | 'transport' | 'team' | 'other';
  available_units: number;
  total_units: number;
  status: 'available' | 'limited' | 'depleted';
}

export interface RouteLine {
  name: string;
  status: 'Safe' | 'Blocked';
  eta: string;
  coords?: [number, number][];
}

interface LiveMapProps {
  incidents: IncidentRecord[];
  resources: ResourceRecord[];
  route?: RouteLine;
  heightClassName?: string;
}

const getCoordinatesFromLabel = (value: string): [number, number] => {
  const hash = [...value].reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0);
  const lat = 40.68 + ((hash % 120) / 200);
  const lng = -74.02 + (((hash >> 4) % 120) / 200);
  return [lat, lng];
};

const getMarkerColor = (severity: IncidentRecord['severity']) => {
  switch (severity) {
    case 'Critical':
      return '#ff4d4f';
    case 'High':
      return '#ff9f1c';
    case 'Medium':
      return '#facc15';
    default:
      return '#34d399';
  }
};

const getResourceColor = (status: ResourceRecord['status']) => {
  switch (status) {
    case 'available':
      return '#34d399';
    case 'limited':
      return '#facc15';
    default:
      return '#f87171';
  }
};

function LiveMap({ incidents, resources, route, heightClassName = 'h-[440px]' }: LiveMapProps) {
  const [useFallbackNasaLayer, setUseFallbackNasaLayer] = useState(false);

  const primaryNasaTileUrl =
    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';
  const fallbackNasaTileUrl =
    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';

  const tileUrl = useFallbackNasaLayer ? fallbackNasaTileUrl : primaryNasaTileUrl;
  const tileAttribution = 'Tiles &copy; NASA GIBS, NASA Earth Observations';

  const incidentPoints = useMemo(
    () =>
      incidents.map((incident) => ({
        id: incident.id,
        title: incident.title,
        subtitle: `${incident.severity} threat`,
        coords: getCoordinatesFromLabel(incident.location || incident.title),
        severity: incident.severity,
      })),
    [incidents],
  );

  const resourcePoints = useMemo(
    () =>
      resources.map((resource) => ({
        id: resource.id,
        title: resource.name,
        subtitle: `${resource.available_units}/${resource.total_units} units`,
        coords: getCoordinatesFromLabel(resource.name),
        status: resource.status,
      })),
    [resources],
  );

  const center: LatLngExpression = useMemo(() => {
    if (route?.coords && route.coords.length) {
      return route.coords[Math.floor(route.coords.length / 2)];
    }
    const allCoords = [...incidentPoints, ...resourcePoints].map((point) => point.coords);
    return allCoords[0] ?? [40.73, -73.99];
  }, [incidentPoints, resourcePoints, route]);

  return (
    <div className={`w-full ${heightClassName} overflow-hidden rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.08)]`}>
      <MapContainer center={center} zoom={7} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
          maxNativeZoom={9}
          maxZoom={13}
          eventHandlers={{
            tileerror: () => {
              setUseFallbackNasaLayer(true);
            },
          }}
        />
        {incidentPoints.map((incident) => (
          <CircleMarker
            key={`incident-${incident.id}`}
            center={incident.coords}
            pathOptions={{ color: getMarkerColor(incident.severity), fillColor: getMarkerColor(incident.severity), fillOpacity: 0.7 }}
            radius={10}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              <div className="text-xs">
                <strong>{incident.title}</strong>
                <div>{incident.subtitle}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
        {resourcePoints.map((resource) => (
          <CircleMarker
            key={`resource-${resource.id}`}
            center={resource.coords}
            pathOptions={{ color: getResourceColor(resource.status), fillColor: getResourceColor(resource.status), fillOpacity: 0.7 }}
            radius={8}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              <div className="text-xs">
                <strong>{resource.title}</strong>
                <div>{resource.subtitle}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
        {route?.coords && route.coords.length > 1 && (
          <Polyline
            positions={route.coords}
            pathOptions={{ color: route.status === 'Safe' ? '#34d399' : '#f87171', weight: 5, opacity: 0.9 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default React.memo(LiveMap);
