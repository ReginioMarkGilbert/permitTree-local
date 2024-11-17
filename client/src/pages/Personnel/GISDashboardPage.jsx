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
    }
  }
`;

const GISDashboardPage = () => {
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

   const layerStyles = {
      protectedAreas: {
         type: 'fill',
         paint: {
            'fill-color': 'rgba(0, 136, 136, 0.4)',
            'fill-outline-color': '#088'
         }
      }
   };

   // Initialize empty GeoJSON if no data exists
   const gisData = data?.getGISData?.protectedAreas || {
      type: 'FeatureCollection',
      features: []
   };

   const layers = [{
      id: 'protectedAreas',
      type: 'geojson',
      data: gisData,
      style: layerStyles.protectedAreas
   }];

   const handleDrawComplete = (coordinates) => {
      console.log('Drawing completed with coordinates:', coordinates);
      if (coordinates && coordinates.length > 0) {
         const coordString = coordinates.map(coord => coord.join(',')).join(';');
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
               <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-green-600 hover:bg-green-700"
               >
                  {showForm ? 'Hide Form' : 'Add Protected Area'}
               </Button>
            </div>

            <div className="space-y-6">
               {showForm && (
                  <ProtectedAreaForm
                     onAreaAdded={handleAreaAdded}
                     onDrawingStateChange={handleDrawingStateChange}
                  />
               )}

               <ProtectedAreaList
                  areas={data?.getGISData?.protectedAreas?.features || []}
                  onUpdate={() => refetch()}
               />

               <Card className="p-6">
                  <GISMap
                     layers={layers}
                     isDrawing={isDrawing}
                     onDrawComplete={handleDrawComplete}
                  />
               </Card>
            </div>
         </div>
      </div>
   );
};

export default GISDashboardPage;
