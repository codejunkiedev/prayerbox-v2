import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${API_KEY}`;
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

interface LocationMarkerProps {
  onPositionChange: (coords: L.LatLng) => void;
  position: L.LatLng | null;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ onPositionChange, position }) => {
  useMapEvents({
    click: e => {
      onPositionChange(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

interface MapControlsProps {
  onLocateMe: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onLocateMe }) => {
  return (
    <div className='leaflet-bottom leaflet-right' style={{ zIndex: 1000 }}>
      <div className='leaflet-control'>
        <button
          onClick={onLocateMe}
          className='bg-white p-2 rounded-md shadow-md hover:bg-gray-100 focus:outline-none'
          aria-label='Move to my location'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='12' cy='12' r='10' />
            <circle cx='12' cy='12' r='1' />
            <line x1='12' y1='2' x2='12' y2='4' />
            <line x1='12' y1='20' x2='12' y2='22' />
            <line x1='4' y1='12' x2='2' y2='12' />
            <line x1='22' y1='12' x2='20' y2='12' />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface CoordinateOverlayProps {
  position: L.LatLng | null;
}

const CoordinateOverlay: React.FC<CoordinateOverlayProps> = ({ position }) => {
  if (!position) return null;

  return (
    <div className='leaflet-top leaflet-right' style={{ zIndex: 1000 }}>
      <div className='leaflet-control bg-white p-2 m-2 rounded-md shadow-md text-sm'>
        <div>
          <span className='font-bold'>Coordinates:</span> {position.lat.toFixed(3)},{' '}
          {position.lng.toFixed(3)}
        </div>
      </div>
    </div>
  );
};

interface MapProps {
  onCoordinatesChange?: (latitude: number, longitude: number) => void;
  coordinates?: { latitude: number; longitude: number } | null;
}

export function Map({ onCoordinatesChange, coordinates }: MapProps) {
  const [currentPosition, setCurrentPosition] = useState<L.LatLng | null>(
    coordinates ? L.latLng(coordinates.latitude, coordinates.longitude) : null
  );

  const mapRef = useRef<L.Map | null>(null);

  const isNearMapEdge = (position: L.LatLng): boolean => {
    if (!mapRef.current) return false;

    const bounds = mapRef.current.getBounds();
    const padding = 0.2;

    const mapWidth = bounds.getEast() - bounds.getWest();
    const mapHeight = bounds.getNorth() - bounds.getSouth();

    const edgeWest = bounds.getWest() + mapWidth * padding;
    const edgeEast = bounds.getEast() - mapWidth * padding;
    const edgeSouth = bounds.getSouth() + mapHeight * padding;
    const edgeNorth = bounds.getNorth() - mapHeight * padding;

    return (
      position.lng <= edgeWest ||
      position.lng >= edgeEast ||
      position.lat <= edgeSouth ||
      position.lat >= edgeNorth
    );
  };

  const handlePositionChange = (coords: L.LatLng) => {
    setCurrentPosition(coords);

    if (mapRef.current && isNearMapEdge(coords)) {
      mapRef.current.setView(coords, mapRef.current.getZoom());
    }

    if (onCoordinatesChange) {
      onCoordinatesChange(coords.lat, coords.lng);
    }
  };

  const mapCenter = currentPosition || L.latLng(33.69, 73.03);
  const zoom = currentPosition && coordinates ? 18 : 15;

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const newLocation = L.latLng(latitude, longitude);

          setCurrentPosition(newLocation);
          if (mapRef.current) {
            mapRef.current.setView(newLocation, 18);
            if (onCoordinatesChange) {
              onCoordinatesChange(newLocation.lat, newLocation.lng);
            }
          }
        },
        error => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    if (coordinates) {
      const newPosition = L.latLng(coordinates.latitude, coordinates.longitude);
      setCurrentPosition(newPosition);

      if (mapRef.current && isNearMapEdge(newPosition)) {
        mapRef.current.setView(newPosition, mapRef.current.getZoom());
      }
    }
  }, [coordinates]);

  return (
    <div className='relative'>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '400px', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <LocationMarker onPositionChange={handlePositionChange} position={currentPosition} />
        <MapControls onLocateMe={handleLocateMe} />
        <CoordinateOverlay position={currentPosition} />
      </MapContainer>
    </div>
  );
}
