import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Locate, Check, AlertCircle, Loader2 } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { toast } from 'sonner';

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${API_KEY}`;
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

interface LocationMarkerProps {
  onPositionChange: (coords: L.LatLng) => void;
  position: L.LatLng | null;
}

/**
 * Interactive marker component that handles map clicks and displays current location
 */
const LocationMarker: React.FC<LocationMarkerProps> = ({ onPositionChange, position }) => {
  useMapEvents({ click: e => onPositionChange(e.latlng) });

  const customMarkerIcon = L.divIcon({
    html: renderToStaticMarkup(
      <MapPin size={32} color='#0f766e' fill='#14b8a6' fillOpacity={0.3} />
    ),
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  if (!position) return null;
  return <Marker position={position} icon={customMarkerIcon}></Marker>;
};

interface CoordinatesDisplayProps {
  position: L.LatLng | null;
}

/**
 * Floating display showing the current latitude and longitude coordinates
 */
const CoordinatesDisplay: React.FC<CoordinatesDisplayProps> = ({ position }) => {
  if (!position) return null;

  return (
    <div
      className='absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded text-xs text-gray-700 font-mono shadow-sm'
      style={{ zIndex: 1000 }}
    >
      {position.lat.toFixed(3)}, {position.lng.toFixed(3)}
    </div>
  );
};

type LocationStatus = 'idle' | 'locating' | 'located' | 'error';

interface LocateMeButtonProps {
  onLocate: () => void;
  status: LocationStatus;
  errorMessage?: string;
}

/**
 * Button component for triggering geolocation with status indicators
 */
const LocateMeButton: React.FC<LocateMeButtonProps> = ({ onLocate, status, errorMessage }) => {
  let buttonColor = 'text-gray-700';
  let ButtonIcon = Locate;
  let title = 'Locate me';

  if (status === 'locating') {
    ButtonIcon = Loader2;
    title = 'Getting your location...';
  } else if (status === 'located') {
    ButtonIcon = Check;
    buttonColor = 'text-emerald-600';
    title = 'Location found';
  } else if (status === 'error') {
    ButtonIcon = AlertCircle;
    buttonColor = 'text-red-500';
    title = errorMessage || 'Location error';
  }

  return (
    <div className='absolute bottom-4 right-4' style={{ zIndex: 1000 }}>
      <button
        onClick={status === 'locating' ? undefined : onLocate}
        disabled={status === 'locating'}
        className={`bg-white/80 backdrop-blur-sm p-2 rounded shadow-sm transition-colors ${
          status === 'locating' ? 'cursor-wait' : 'hover:bg-white'
        }`}
        aria-label={title}
        title={title}
      >
        <ButtonIcon
          size={18}
          className={`${buttonColor} ${status === 'locating' ? 'animate-spin' : ''}`}
        />
      </button>
    </div>
  );
};

interface MapProps {
  onCoordinatesChange?: (latitude: number, longitude: number) => void;
  coordinates?: { latitude: number; longitude: number } | null;
}

/**
 * Interactive map component with location selection and geolocation features
 */
export function Map({ onCoordinatesChange, coordinates }: MapProps) {
  const [currentPosition, setCurrentPosition] = useState<L.LatLng | null>(
    coordinates ? L.latLng(coordinates.latitude, coordinates.longitude) : null
  );
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationError, setLocationError] = useState<string>('');

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
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('locating');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newLocation = L.latLng(latitude, longitude);

        setCurrentPosition(newLocation);
        setLocationStatus('located');

        setTimeout(() => setLocationStatus('idle'), 2000);

        if (mapRef.current) {
          mapRef.current.setView(newLocation, 18);
          if (onCoordinatesChange) {
            onCoordinatesChange(newLocation.lat, newLocation.lng);
          }
        }
      },
      error => {
        console.error('Error getting location:', error);
        setLocationStatus('error');

        let errorMsg = 'Unable to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out';
            break;
        }

        setLocationError(errorMsg);
        toast.error(`${errorMsg}. Please check your browser permissions.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
    <div className='relative w-full h-full'>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '400px', width: '100%' }}
        ref={mapRef}
        className='z-0 rounded-lg'
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <LocationMarker onPositionChange={handlePositionChange} position={currentPosition} />
      </MapContainer>

      <CoordinatesDisplay position={currentPosition} />
      <LocateMeButton
        onLocate={handleLocateMe}
        status={locationStatus}
        errorMessage={locationError}
      />
    </div>
  );
}
