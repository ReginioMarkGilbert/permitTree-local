import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { gql, useMutation } from '@apollo/client';

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

const ProtectedAreaForm = ({ onAreaAdded }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const [addProtectedArea] = useMutation(ADD_PROTECTED_AREA, {
    onCompleted: (data) => {
      onAreaAdded(data.addProtectedArea);
      resetForm();
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

    // Convert coordinates string to array of coordinates
    const coordArray = coordinates.split(';').map(pair =>
      pair.split(',').map(num => parseFloat(num.trim()))
    );

    addProtectedArea({
      variables: {
        input: {
          name,
          type,
          geometry: {
            type: "Polygon",
            coordinates: [coordArray]
          }
        }
      }
    });
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Area Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter protected area name"
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Area Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select type</option>
            <option value="National Park">National Park</option>
            <option value="Wildlife Sanctuary">Wildlife Sanctuary</option>
            <option value="Marine Protected Area">Marine Protected Area</option>
            <option value="Forest Reserve">Forest Reserve</option>
          </select>
        </div>

        <div>
          <Label htmlFor="coordinates">Coordinates</Label>
          <Input
            id="coordinates"
            value={coordinates}
            onChange={(e) => setCoordinates(e.target.value)}
            placeholder="Format: long1,lat1; long2,lat2; long3,lat3..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter coordinates in clockwise order, separated by semicolons
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDrawing(!isDrawing)}
            className="flex-1"
          >
            {isDrawing ? 'Cancel Drawing' : 'Draw on Map'}
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Add Protected Area
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProtectedAreaForm;
