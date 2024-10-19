import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const COVEditForm = ({ formData, handleInputChange }) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          className="col-span-3"
          value={formData.name || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="address" className="text-right">
          Address
        </Label>
        <Input
          id="address"
          name="address"
          className="col-span-3"
          value={formData.address || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="cellphone" className="text-right">
          Cellphone
        </Label>
        <Input
          id="cellphone"
          name="cellphone"
          className="col-span-3"
          value={formData.cellphone || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="purpose" className="text-right">
          Purpose
        </Label>
        <Textarea
          id="purpose"
          name="purpose"
          className="col-span-3"
          value={formData.purpose || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="driverName" className="text-right">
          Driver Name
        </Label>
        <Input
          id="driverName"
          name="driverName"
          className="col-span-3"
          value={formData.driverName || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="driverLicenseNumber" className="text-right">
          Driver License Number
        </Label>
        <Input
          id="driverLicenseNumber"
          name="driverLicenseNumber"
          className="col-span-3"
          value={formData.driverLicenseNumber || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="vehiclePlateNumber" className="text-right">
          Vehicle Plate Number
        </Label>
        <Input
          id="vehiclePlateNumber"
          name="vehiclePlateNumber"
          className="col-span-3"
          value={formData.vehiclePlateNumber || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="originAddress" className="text-right">
          Origin Address
        </Label>
        <Input
          id="originAddress"
          name="originAddress"
          className="col-span-3"
          value={formData.originAddress || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="destinationAddress" className="text-right">
          Destination Address
        </Label>
        <Input
          id="destinationAddress"
          name="destinationAddress"
          className="col-span-3"
          value={formData.destinationAddress || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      {/* Add more fields specific to COV */}
    </div>
  );
};

export default COVEditForm;
