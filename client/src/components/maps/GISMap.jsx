import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import Draw from 'ol/interaction/Draw';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';

const GISMap = ({ layers = [], isDrawing = false, onDrawComplete }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const vectorLayers = useRef({});
  const drawInteraction = useRef(null);
  const drawLayer = useRef(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    // Create draw layer
    const drawSource = new VectorSource();
    drawLayer.current = new VectorLayer({
      source: drawSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(34, 197, 94, 0.2)'
        }),
        stroke: new Stroke({
          color: '#16a34a',
          width: 2
        })
      })
    });

    try {
      map.current = new Map({
        target: mapContainer.current,
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          drawLayer.current
        ],
        view: new View({
          center: fromLonLat([122.0, 13.4]), // Marinduque center
          zoom: 10,
          maxZoom: 19,
          minZoom: 8
        })
      });

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.setTarget(undefined);
        map.current = null;
      }
    };
  }, []);

  // Handle drawing mode
  useEffect(() => {
    if (!map.current) return;

    if (isDrawing) {
      // Clear previous drawings
      drawLayer.current.getSource().clear();

      // Create draw interaction
      drawInteraction.current = new Draw({
        source: drawLayer.current.getSource(),
        type: 'Polygon'
      });

      // Handle drawing complete
      drawInteraction.current.on('drawend', (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();
        const coordinates = geometry.getCoordinates()[0].map(coord => {
          const lonLat = toLonLat(coord);
          return [
            Number(lonLat[0].toFixed(6)),
            Number(lonLat[1].toFixed(6))
          ];
        });

        // Remove last coordinate if it's the same as the first (OpenLayers adds it automatically)
        if (coordinates.length > 0 &&
            coordinates[0][0] === coordinates[coordinates.length-1][0] &&
            coordinates[0][1] === coordinates[coordinates.length-1][1]) {
          coordinates.pop();
        }

        onDrawComplete?.(coordinates);
        map.current.removeInteraction(drawInteraction.current);
      });

      map.current.addInteraction(drawInteraction.current);
    } else {
      if (drawInteraction.current) {
        map.current.removeInteraction(drawInteraction.current);
        drawInteraction.current = null;
      }
    }

    return () => {
      if (drawInteraction.current) {
        map.current.removeInteraction(drawInteraction.current);
        drawInteraction.current = null;
      }
    };
  }, [isDrawing, onDrawComplete]);

  // Update layers
  useEffect(() => {
    if (!map.current) return;

    Object.values(vectorLayers.current).forEach(layer => {
      map.current.removeLayer(layer);
    });
    vectorLayers.current = {};

    layers.forEach(layer => {
      if (layer.type === 'geojson' && layer.data?.features?.length > 0) {
        try {
          const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(layer.data, {
              featureProjection: 'EPSG:3857'
            })
          });

          const style = new Style({
            fill: new Fill({
              color: layer.style.paint['fill-color'] || 'rgba(100, 150, 100, 0.5)'
            }),
            stroke: new Stroke({
              color: layer.style.paint['fill-outline-color'] || '#333333',
              width: 1
            }),
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({
                color: layer.style.paint['circle-color'] || '#ff0000'
              })
            })
          });

          const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: style
          });

          vectorLayers.current[layer.id] = vectorLayer;
          map.current.addLayer(vectorLayer);

          const extent = vectorSource.getExtent();
          if (extent && !isEmptyExtent(extent)) {
            map.current.getView().fit(extent, {
              padding: [50, 50, 50, 50],
              maxZoom: 12,
              duration: 1000
            });
          }
        } catch (error) {
          console.error(`Error adding layer ${layer.id}:`, error);
        }
      }
    });
  }, [layers]);

  const isEmptyExtent = (extent) => {
    return !extent || extent.some(coord => !isFinite(coord)) ||
           (extent[0] === Infinity && extent[1] === Infinity &&
            extent[2] === -Infinity && extent[3] === -Infinity);
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      {isDrawing && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-md shadow-md">
          Click on the map to start drawing. Double-click to finish.
        </div>
      )}
    </div>
  );
};

export default GISMap;
