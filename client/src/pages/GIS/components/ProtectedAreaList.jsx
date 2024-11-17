import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { FaTrash, FaEdit } from 'react-icons/fa';
import ProtectedAreaForm from './ProtectedAreaForm';

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

  const [updateArea] = useMutation(UPDATE_PROTECTED_AREA, {
    onCompleted: () => {
      toast.success('Protected area updated successfully!');
      setEditingArea(null);
      onUpdate();
    },
    onError: (error) => {
      toast.error(`Failed to update protected area: ${error.message}`);
    }
  });

  const handleDelete = async (area) => {
    console.log('Area to delete:', area);
    if (!area || !area.id) {
      console.error('No area ID provided for deletion', area);
      toast.error('Cannot delete area: Missing ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this protected area?')) {
      try {
        console.log('Deleting area with ID:', area.id);
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

  const handleEdit = (area) => {
    if (!area || !area.id) {
      console.error('No area ID provided for editing');
      toast.error('Cannot edit area: Missing ID');
      return;
    }
    setEditingArea(area);
  };

  const handleUpdate = (updatedData) => {
    if (!editingArea || !editingArea.id) {
      console.error('No area ID provided for update');
      toast.error('Cannot update area: Missing ID');
      return;
    }

    updateArea({
      variables: {
        id: editingArea.id.toString(), // Ensure ID is a string
        input: updatedData
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingArea(null);
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all protected areas?')) {
      try {
        await deleteAllAreas();
      } catch (error) {
        console.error('Delete all error:', error);
      }
    }
  };

  if (editingArea) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-green-700">Edit Protected Area</h3>
          <Button variant="outline" onClick={handleCancelEdit}>
            Cancel Edit
          </Button>
        </div>
        <ProtectedAreaForm
          initialData={{
            name: editingArea.properties.name,
            type: editingArea.properties.type,
            geometry: editingArea.geometry
          }}
          onSubmit={handleUpdate}
          isEditing={true}
        />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-700">Protected Areas</h3>
        {areas.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAll}
          >
            Delete All
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {areas.length === 0 ? (
          <p key="no-areas" className="text-gray-500 text-center py-4">
            No protected areas added yet
          </p>
        ) : (
          areas.map((area) => (
            <div
              key={area.id || `area-${area.properties.name}`}
              className="flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <div>
                <h4 className="font-medium">{area.properties.name}</h4>
                <p className="text-sm text-gray-600">{area.properties.type}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(area)}
                  title="Delete area"
                >
                  <FaTrash className="h-4 w-4 text-red-500" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(area)}
                  title="Edit area"
                >
                  <FaEdit className="h-4 w-4 text-blue-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ProtectedAreaList;
