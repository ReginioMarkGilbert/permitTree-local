import React, { useState } from 'react';
// import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { FaTrash, FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
// import ProtectedAreaForm from './ProtectedAreaForm';

const DELETE_PROTECTED_AREA = gql`
  mutation DeleteProtectedArea($id: ID!) {
    deleteProtectedArea(id: $id)
  }
`;

const DELETE_ALL_PROTECTED_AREAS = gql`
  mutation DeleteAllProtectedAreas {
    deleteAllProtectedAreas
  }
`;

const UPDATE_PROTECTED_AREA = gql`
  mutation UpdateProtectedArea($id: ID!, $input: ProtectedAreaInput!) {
    updateProtectedArea(id: $id, input: $input) {
      type
      features {
        type
        geometry
        properties
      }
    }
  }
`;

const ProtectedAreaList = ({ areas, onUpdate }) => {
   const [editingArea, setEditingArea] = useState(null);

   const [deleteArea] = useMutation(DELETE_PROTECTED_AREA, {
      onCompleted: () => {
         toast.success('Protected area deleted successfully!');
         onUpdate();
      },
      onError: (error) => {
         toast.error(`Failed to delete protected area: ${error.message}`);
      }
   });

   const [deleteAllAreas] = useMutation(DELETE_ALL_PROTECTED_AREAS, {
      onCompleted: () => {
         toast.success('All protected areas deleted successfully!');
         onUpdate();
      },
      onError: (error) => {
         toast.error(`Failed to delete all protected areas: ${error.message}`);
      }
   });

   const handleDelete = async (area) => {
      if (!area || !area.id) {
         console.error('No area ID provided for deletion', area);
         toast.error('Cannot delete area: Missing ID');
         return;
      }

      if (window.confirm('Are you sure you want to delete this protected area?')) {
         try {
            await deleteArea({
               variables: {
                  id: area.id.toString()
               }
            });
         } catch (error) {
            console.error('Delete error:', error);
         }
      }
   };

   const handleDeleteAll = async () => {
      if (window.confirm('Are you sure you want to delete all protected areas? This action cannot be undone.')) {
         try {
            await deleteAllAreas();
         } catch (error) {
            console.error('Delete all error:', error);
         }
      }
   };

   return (
      <div>
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <FaMapMarkerAlt className="text-green-600 w-5 h-5" />
               <h3 className="text-lg font-semibold text-gray-800">Protected Areas</h3>
            </div>
            {areas.length > 0 && (
               <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="text-xs"
               >
                  Delete All Areas
               </Button>
            )}
         </div>

         <div className="space-y-3">
            {areas.length === 0 ? (
               <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <FaMapMarkerAlt className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-500">
                     No protected areas added yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                     Use the form above to add protected areas
                  </p>
               </div>
            ) : (
               areas.map((area) => (
                  <div
                     key={area.id || `area-${area.properties.name}`}
                     className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                     <div className="p-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <h4 className="text-base font-semibold text-gray-900">
                                 {area.properties.name}
                              </h4>
                              <div className="mt-1 flex items-center gap-2">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {area.properties.type}
                                 </span>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => handleDelete(area)}
                                 className="h-8 w-8 p-0"
                                 title="Delete area"
                              >
                                 <FaTrash className="h-4 w-4 text-red-500" />
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

export default ProtectedAreaList;
