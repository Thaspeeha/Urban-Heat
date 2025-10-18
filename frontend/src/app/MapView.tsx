'use client';

import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// Fix Leaflet's default icon paths
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface RouteData {
  start_coords: [number, number];
  end_coords: [number, number];
  route_fast: [number, number][];
  route_cool: [number, number][];
}

interface MapViewProps {
  routes: RouteData;
}

export default function MapView({ routes }: MapViewProps) {
  // Validate routes exists
  if (!routes) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fee', 
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: '#c00'
      }}>
        ⚠️ No route data provided
      </div>
    );
  }

  const { start_coords, end_coords, route_fast, route_cool } = routes;

  console.log('MapView rendering:', {
    start_coords,
    end_coords,
    route_fast_length: route_fast?.length,
    route_cool_length: route_cool?.length,
    first_fast_coord: route_fast?.[0],
    first_cool_coord: route_cool?.[0]
  });

  // Validate routes
  if (!route_fast || !route_cool || route_fast.length === 0 || route_cool.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fee', 
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: '#c00'
      }}>
        ⚠️ Invalid route data received
      </div>
    );
  }

  // Calculate center point between start and end
  const centerLat = (start_coords[0] + end_coords[0]) / 2;
  const centerLng = (start_coords[1] + end_coords[1]) / 2;
  const center: [number, number] = [centerLat, centerLng];

  return (
    <div style={{ 
      border: '2px solid #ddd', 
      borderRadius: '8px', 
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Fastest Route - Red */}
        <Polyline 
          positions={route_fast} 
          color="#ff4444" 
          weight={5} 
          opacity={0.7}
          dashArray="10, 5"
        />

        {/* Cooler Route - Blue */}
        <Polyline 
          positions={route_cool} 
          color="#4444ff" 
          weight={5} 
          opacity={0.7}
        />

        {/* Start Marker */}
        <Marker position={start_coords}>
          <Popup>
            <strong>🏁 Start</strong>
            <br />
            {start_coords[0].toFixed(5)}, {start_coords[1].toFixed(5)}
          </Popup>
        </Marker>

        {/* End Marker */}
        <Marker position={end_coords}>
          <Popup>
            <strong>🎯 Destination</strong>
            <br />
            {end_coords[0].toFixed(5)}, {end_coords[1].toFixed(5)}
          </Popup>
        </Marker>
      </MapContainer>
      
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '14px'
      }}>
        <span>
          <span style={{ 
            display: 'inline-block', 
            width: '20px', 
            height: '3px', 
            backgroundColor: '#ff4444',
            marginRight: '5px',
            verticalAlign: 'middle'
          }}></span>
          Fastest Route
        </span>
        <span>
          <span style={{ 
            display: 'inline-block', 
            width: '20px', 
            height: '3px', 
            backgroundColor: '#4444ff',
            marginRight: '5px',
            verticalAlign: 'middle'
          }}></span>
          Cooler Route
        </span>
      </div>
    </div>
  );
}