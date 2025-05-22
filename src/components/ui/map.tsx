import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // @ts-expect-error - Known issue with Leaflet types
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

interface LocationMarkerProps {
  setCoords: (coords: L.LatLng) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ setCoords }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click: e => {
      setPosition(e.latlng);
      setCoords(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
};

export default function Map() {
  const [coordinates, setCoordinates] = useState<L.LatLng | null>(null);

  return (
    <div>
      <MapContainer
        center={[30.3753, 69.3451]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker setCoords={setCoordinates} />
      </MapContainer>

      {coordinates && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Selected Coordinates:</strong>
          <p>Latitude: {coordinates.lat}</p>
          <p>Longitude: {coordinates.lng}</p>
        </div>
      )}
    </div>
  );
}
