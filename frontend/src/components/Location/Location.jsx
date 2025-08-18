import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icon default supaya marker muncul
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const Location = () => {
  const start = [-7.3613965, 110.4262988]; // Nogosaren
  const destination = [-7.3615489, 110.4263604]; // JCQG+9GQ Nagasaren
  const center = destination; // fokus ke tujuan

  return (
    <div className="w-screen flex flex-col items-center py-10 max-w-7xl px-4 sm:px-0 mx-auto h-screen">
      <div className="flex items-center w-full sm:mb-6 ">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Cari tahu lokasi kami
        </h1>
      </div>

      <div className="flex items-center w-full h-screen z-0">
        <MapContainer
          center={center}
          zoom={6``}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          <Marker position={start}>
            <Popup>Desa Nogosaren (Start)</Popup>
          </Marker>

          <Marker position={destination}>
            <Popup>JCQG+9GQ Nagasaren (Tujuan)</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default Location;
