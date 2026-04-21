import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Tooltip, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const ResizeHandler = ({ active }) => {
    const map = useMap();
    useEffect(() => {
        if (active) setTimeout(() => map.invalidateSize(), 100);
    }, [active, map]);
    return null;
};

const DistrictEditor = ({ onSave, onUpdate, onDelete, existingDistricts, active }) => {
    const fgRef = useRef(null);

    const handleCreated = (e) => {
        const layer = e.layer;
        if (layer instanceof L.Polygon) {
            const coordinates = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
            const name = prompt("Введите название района:", "Новый район");
            if (!name) return;
            const priceInput = prompt("Введите стоимость доставки (в рублях):", "0");
            const deliveryPrice = parseFloat(priceInput);
            if (isNaN(deliveryPrice)) {
                alert("Неверная стоимость доставки");
                return;
            }
            onSave({ name, coordinates, deliveryPrice });
        }
    };

    const handleEdited = (e) => {
        e.layers.eachLayer((layer) => {
            if (layer instanceof L.Polygon) {
                const meta = layer.options?.meta;
                if (!meta?.id) return;
                const coordinates = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
                onUpdate(meta.id, {
                    name: meta.name,
                    deliveryPrice: meta.deliveryPrice,
                    coordinates
                });
            }
        });
    };

    const handleDeleted = (e) => {
        e.layers.eachLayer((layer) => {
            const meta = layer.options?.meta;
            if (meta?.id) onDelete(meta.id);
        });
    };

    return (
        <div style={{ height: '500px', width: '100%' }}>
            {/* key={active} перезапускает карту при активации вкладки */}
            <MapContainer
                key={active ? 'zones-map' : 'hidden'}
                center={[48.507245, 18.755087]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
            >
                <ResizeHandler active={active} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <FeatureGroup ref={fgRef}>
                    <EditControl
                        position="topright"
                        onCreated={handleCreated}
                        onEdited={handleEdited}
                        onDeleted={handleDeleted}
                        edit={{ featureGroup: fgRef.current ?? new L.FeatureGroup() }}
                        draw={{
                            polygon: true,
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false
                        }}
                    />
                    {existingDistricts?.map((district) => {
                        const coords = district.coordinates.map(c => [c[0], c[1]]);
                        return (
                            <Polygon
                                key={`district-${district.id}`}
                                positions={coords}
                                pathOptions={{
                                    color: 'blue',
                                    meta: {
                                        id: district.id,
                                        name: district.name,
                                        deliveryPrice: district.deliveryPrice
                                    }
                                }}
                            >
                                <Tooltip sticky>
                                    {district.name} — {district.deliveryPrice} ₽
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
