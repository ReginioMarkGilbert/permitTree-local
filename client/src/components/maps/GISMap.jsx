import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';

const GISMap = ({ layers = [] }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const vectorLayers = useRef({});

  useEffect(() => {
    console.log('Initializing map...');
    if (map.current) return;

    try {
      // Initialize map
      map.current = new Map({
        target: mapContainer.current,
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([122.5, 12.8]), // Philippines center
          zoom: 6,
          maxZoom: 19,
          minZoom: 4
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

  // Update layers when they change
  useEffect(() => {
    if (!map.current) {
      console.error('Map not initialized');
      return;
    }

    console.log('Updating layers:', layers);

    // Remove old layers
    Object.values(vectorLayers.current).forEach(layer => {
      console.log('Removing layer:', layer);
      map.current.removeLayer(layer);
    });
    vectorLayers.current = {};

    // Add new layers
    layers.forEach(layer => {
      if (layer.type === 'geojson') {
        try {
          console.log('Adding layer:', layer.id, layer.data);

          const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(layer.data, {
              featureProjection: 'EPSG:3857'
            })
          });

          console.log('Features loaded:', vectorSource.getFeatures().length);

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

          // Fit view to layer extent
          const extent = vectorSource.getExtent();
          map.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 12
          });

        } catch (error) {
          console.error(`Error adding layer ${layer.id}:`, error);
        }
      }
    });
  }, [layers]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default GISMap;
