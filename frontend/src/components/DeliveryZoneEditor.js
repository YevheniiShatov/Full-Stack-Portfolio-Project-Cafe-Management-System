import React from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Tooltip } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

const DistrictEditor = ({ onSave, existingDistricts }) => {

    const handleCreated = (e) => {
        const layer = e.layer;
        if (layer instanceof L.Polygon) {
            const coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);

            const name = prompt("Enter district name:", "New District");
            if (!name) return;

            const priceInput = prompt("Enter delivery price ($):", "0");
            const deliveryPrice = parseFloat(priceInput);
            if (isNaN(deliveryPrice)) {
                alert("Invalid delivery price.");
                return;
            }

            onSave({ name, coordinates, deliveryPrice });
        }
    };

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <MapContainer center={[55.751244, 37.618423]} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <FeatureGroup>
                    <EditControl
                        position="topright"
                        onCreated={handleCreated}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false
                        }}
                    />
                    {existingDistricts && existingDistricts.map(district => {
                        const coords = district.coordinates.map(c => [c[0], c[1]]);
                        return (
                            <Polygon
                                key={district.id}
                                positions={coords}
                                pathOptions={{ color: 'blue' }}
                            >
                                <Tooltip sticky>
                                    {district.name} — ${district.deliveryPrice}
                                </Tooltip>
                            </Polygon>
                        );
                    })}
                </FeatureGroup>
            </MapContainer>
        </div>
    );
};

export default DistrictEditor;
