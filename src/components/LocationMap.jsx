import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { useEffect } from "react";


function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      setPosition([lat, lng]);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await response.json();

        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.municipality ||
          "";

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          city: city,
        });
      } catch (error) {
        console.error("Erreur géolocalisation :", error);

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          city: "",
        });
      }
    },
  });

  return position ? <Marker position={position} /> : null;
}

function ResizeMap() {

  const map = useMap();

  useEffect(() => {

    setTimeout(() => {

      map.invalidateSize();

    }, 200);

  }, [map]);

  return null;
}

export default function LocationMap({
  onLocationSelect,
  small,
  large
}){
  return (
    <div style={{ marginBottom: "0px" }}>
    <div
  style={{
    height: small ? "180px" : "70vh",
    width: "100%"
  }}
>
  <MapContainer
  center={[33.5731, -7.5898]}
  zoom={small ? 8 : 13}
  style={{
    height: small ? "180px" : "100%",
    width: "100%",
    borderRadius: "12px"
  }}
>
        <ResizeMap />

      <TileLayer
  attribution='&copy; OpenStreetMap'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

        <LocationMarker
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
    </div>
  );
}