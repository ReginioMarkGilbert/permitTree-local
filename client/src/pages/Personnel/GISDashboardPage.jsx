import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import GISMap from '@/components/maps/GISMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedAreaForm from './components/ProtectedAreaForm';
import { Button } from "@/components/ui/button";
import ProtectedAreaList from './components/ProtectedAreaList';

const GET_GIS_DATA = gql`
  query GetGISData {
    getGISData {
      protectedAreas {
        type
        features {
          id
          type
          geometry
          properties
        }
      }
      forestCover {
        type
        features {
          id
          type
          geometry
          properties
        }
      }
      miningSites {
        type
        features {
          id
          type
          geometry
          properties
        }
      }
      coastalResources {
        type
        features {
          id
          type
          geometry
          properties
        }
      }
      landUse {
        type
        features {
          id
          type
          geometry
          properties
        }
      }
    }
  }
`;

const GISDashboardPage = () => {
  const [activeLayer, setActiveLayer] = useState('protectedAreas');
  const [showForm, setShowForm] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const { loading, error, data, refetch } = useQuery(GET_GIS_DATA);

  if (loading) return <Skeleton className="w-full h-[600px]" />;
  if (error) {
    console.error('GIS data error:', error);
    return <p>Error loading GIS data: {error.message}</p>;
  }

  const handleAreaAdded = () => {
    refetch();
    setShowForm(false);
  };

  console.log('Raw GIS data:', data);
  console.log('Active layer:', activeLayer);
  console.log('Layer data:', data?.getGISData?.[activeLayer]);

  const layerStyles = {
    protectedAreas: {
      type: 'fill',
      paint: {
        'fill-color': 'rgba(0, 136, 136, 0.4)',
        'fill-outline-color': '#088'
      }
    },
    forestCover: {
      type: 'fill',
      paint: {
        'fill-color': 'rgba(0, 102, 51, 0.5)',
        'fill-outline-color': '#063'
      }
    },
    miningSites: {
      type: 'circle',
      paint: {
        'circle-radius': 6,
        'circle-color': '#f00',
        'circle-opacity': 0.7
      }
    },
    coastalResources: {
      type: 'fill',
      paint: {
        'fill-color': 'rgba(51, 102, 170, 0.4)',
        'fill-outline-color': '#36a'
      }
    },
    landUse: {
      type: 'fill',
      paint: {
        'fill-color': [
          'match',
          ['get', 'type'],
          'agricultural', '#ffcc00',
          'residential', '#cc0066',
          'commercial', '#ff6600',
          'industrial', '#993399',
          '#666666'
        ],
        'fill-opacity': 0.5
      }
    }
  };

  // Ensure data exists and has the correct structure
  const gisData = data?.getGISData?.[activeLayer];
  if (!gisData) {
    console.error('No GIS data available for layer:', activeLayer);
    return <p>No data available for the selected layer</p>;
  }

  const layers = [{
    id: activeLayer,
    type: 'geojson',
    data: gisData,
    style: layerStyles[activeLayer]
  }];

  console.log('Prepared layers:', layers);

  const handleDrawComplete = (coordinates) => {
    console.log('Drawing completed with coordinates:', coordinates);
    // This will be passed to the form component
    if (coordinates && coordinates.length > 0) {
      const coordString = coordinates.map(coord => coord.join(',')).join(';');
      // Find the form component and update its coordinates
      const formElement = document.querySelector('#protected-area-form');
      if (formElement) {
        const event = new CustomEvent('drawingComplete', {
          detail: { coordinates: coordString }
        });
        formElement.dispatchEvent(event);
      }
    }
    setIsDrawing(false);
  };

  const handleDrawingStateChange = (drawingState) => {
    setIsDrawing(drawingState);
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto pt-16 sm:pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-green-700">
            GIS Dashboard
          </h1>
          {activeLayer === 'protectedAreas' && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              {showForm ? 'Hide Form' : 'Add Protected Area'}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {showForm && activeLayer === 'protectedAreas' && (
            <ProtectedAreaForm
              onAreaAdded={handleAreaAdded}
              onDrawingStateChange={handleDrawingStateChange}
            />
          )}

          {activeLayer === 'protectedAreas' && (
            <ProtectedAreaList
              areas={data?.getGISData?.protectedAreas?.features || []}
              onUpdate={() => refetch()}
            />
          )}

          <Card className="p-6">
            <Tabs defaultValue="protectedAreas" onValueChange={setActiveLayer}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="protectedAreas">Protected Areas</TabsTrigger>
                <TabsTrigger value="forestCover">Forest Cover</TabsTrigger>
                <TabsTrigger value="miningSites">Mining Sites</TabsTrigger>
                <TabsTrigger value="coastalResources">Coastal Resources</TabsTrigger>
                <TabsTrigger value="landUse">Land Use</TabsTrigger>
              </TabsList>

              <TabsContent value={activeLayer} className="mt-6">
                <GISMap
                  layers={layers}
                  isDrawing={isDrawing}
                  onDrawComplete={handleDrawComplete}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GISDashboardPage;
