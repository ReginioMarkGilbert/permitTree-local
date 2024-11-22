import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { FaDrawPolygon, FaPencilAlt, FaCheck } from 'react-icons/fa';

const ADD_PROTECTED_AREA = gql`
  mutation AddProtectedArea($input: ProtectedAreaInput!) {
    addProtectedArea(input: $input) {
      type
      features {
        type
        geometry
        properties
      }
    }
  }
`;

const ProtectedAreaForm = ({ onAreaAdded, onDrawingStateChange, initialData, onSubmit, isEditing }) => {
   const [name, setName] = useState(initialData?.name || '');
   const [type, setType] = useState(initialData?.type || '');
   const [coordinates, setCoordinates] = useState(
      initialData?.geometry ?
         initialData.geometry.coordinates[0].map(coord => coord.join(',')).join(';')
         : ''
   );
   const [isDrawing, setIsDrawing] = useState(false);

   const [addProtectedArea] = useMutation(ADD_PROTECTED_AREA, {
      onCompleted: (data) => {
         toast.success('Protected area added successfully!');
         onAreaAdded(data.addProtectedArea);
         resetForm();
      },
      onError: (error) => {
         toast.error(`Failed to add protected area: ${error.message}`);
      }
   });

   const resetForm = () => {
      setName('');
      setType('');
      setCoordinates('');
      setIsDrawing(false);
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      const coordArray = coordinates.split(';').map(pair =>
         pair.split(',').map(num => parseFloat(num.trim()))
      );

      if (coordArray.length > 0) {
         coordArray.push([...coordArray[0]]);
      }

      const data = {
         name,
         type,
         geometry: {
            type: "Polygon",
            coordinates: [coordArray]
         }
      };

      if (isEditing) {
         onSubmit(data);
      } else {
         addProtectedArea({
            variables: {
               input: data
            }
         }).catch(error => {
            console.error('Mutation error:', error);
         });
      }
   };

   useEffect(() => {
      const handleDrawingComplete = (event) => {
         setCoordinates(event.detail.coordinates);
         setIsDrawing(false);
      };

      const formElement = document.getElementById('protected-area-form');
      if (formElement) {
         formElement.addEventListener('drawingComplete', handleDrawingComplete);
      }

      return () => {
         if (formElement) {
            formElement.removeEventListener('drawingComplete', handleDrawingComplete);
         }
      };
   }, []);

   const startDrawing = () => {
      setIsDrawing(true);
      onDrawingStateChange(true);
   };

   return (
      <form id="protected-area-form" onSubmit={handleSubmit} className="p-6 space-y-6">
         <div className="flex items-center gap-2 mb-6">
            <FaPencilAlt className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">
               {isEditing ? 'Edit Protected Area' : 'Add Protected Area'}
            </h2>
         </div>

         <div className="space-y-4">
            <div>
               <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Area Name
               </Label>
               <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                     focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Enter area name"
                  required
               />
            </div>

            <div>
               <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Area Type
               </Label>
               <Input
                  id="type"
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                     focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Enter area type"
                  required
               />
            </div>

            <div>
               <Label htmlFor="coordinates" className="text-sm font-medium text-gray-700">
                  Coordinates
               </Label>
               <div className="mt-1 relative">
                  <Input
                     id="coordinates"
                     type="text"
                     value={coordinates}
                     onChange={(e) => setCoordinates(e.target.value)}
                     className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                     placeholder="Draw on map to set coordinates"
                     readOnly
                  />
                  <Button
                     type="button"
                     onClick={startDrawing}
                     className={`mt-2 w-full bg-green-50 border border-green-200 hover:bg-green-100 text-green-700
                        ${isDrawing ? 'bg-green-100' : ''} transition-colors duration-200`}
                  >
                     <FaDrawPolygon className="w-4 h-4 mr-2" />
                     {isDrawing ? 'Drawing Mode Active' : 'Draw on Map'}
                  </Button>
               </div>
            </div>
         </div>

         <div className="pt-4">
            <Button
               type="submit"
               className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 flex items-center justify-center gap-2"
               disabled={!coordinates || isDrawing}
            >
               <FaCheck className="w-4 h-4" />
               {isEditing ? 'Update Area' : 'Add Area'}
            </Button>
         </div>
      </form>
   );
};

export default ProtectedAreaForm;
