import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import GISMap from '@/components/maps/GISMap';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedAreaForm from './components/ProtectedAreaForm';
import { Button } from '@/components/ui/button';
import ProtectedAreaList from './components/ProtectedAreaList';
import { FaMapMarkedAlt, FaPlus } from 'react-icons/fa';

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

   if (loading) return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 py-6 sm:py-8">
         <div className="max-w-7xl mx-auto pt-16 sm:pt-24">
            <Skeleton className="w-full h-[600px] rounded-2xl" />
         </div>
      </div>
   );

   if (error) {
      console.error('GIS data error:', error);
      return (
         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto pt-16 sm:pt-24">
               <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  Error loading GIS data: {error.message}
               </div>
            </div>
         </div>
      );
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 pt-28 pb-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
               <div className="flex items-center gap-3">
                  <FaMapMarkedAlt className="text-green-600 dark:text-green-400 w-8 h-8" />
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        GIS Dashboard
                     </h1>
                     <p className="text-muted-foreground text-sm mt-1">
                        Manage and visualize protected areas in Marinduque
                     </p>
                  </div>
               </div>
               <Button
                  onClick={() => setShowForm(!showForm)}
                  className="group flex items-center gap-2"
               >
                  {showForm ? (
                     <>Hide Form</>
                  ) : (
                     <>
                        <FaPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                        Add Protected Area
                     </>
                  )}
               </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-8">
                  <Card className="overflow-hidden shadow-lg">
                     <div className="h-[600px] relative">
                        <GISMap
                           layers={layers}
                           isDrawing={isDrawing}
                           onDrawComplete={handleDrawComplete}
                        />
                     </div>
                  </Card>
               </div>

               <div className="lg:col-span-4">
                  {showForm && (
                     <Card className="shadow-lg">
                        <ProtectedAreaForm
                           onAreaAdded={handleAreaAdded}
                           onDrawingStateChange={handleDrawingStateChange}
                        />
                     </Card>
                  )}

                  <Card className="mt-6 shadow-lg">
                     <div className="p-6">
                        <ProtectedAreaList
                           areas={gisData.features}
                           onUpdate={refetch}
                        />
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </div>
   );
};

export default GISDashboardPage;
