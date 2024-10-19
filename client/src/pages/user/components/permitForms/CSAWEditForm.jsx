import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const CSAWEditForm = ({ formData, handleInputChange }) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="registrationType" className="text-right">
          Registration Type
        </Label>
        <Select
          id="registrationType"
          name="registrationType"
          className="col-span-3"
          value={formData.registrationType || ''}
          onChange={handleInputChange}
          required
        >
          <option value="New">New Registration</option>
          <option value="Renewal">Renewal</option>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="ownerName" className="text-right">
          Owner Name
        </Label>
        <Input
          id="ownerName"
          name="ownerName"
          className="col-span-3"
          value={formData.ownerName || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      {/* Add more fields specific to CSAW */}
    </div>
  );
};

export default CSAWEditForm;
