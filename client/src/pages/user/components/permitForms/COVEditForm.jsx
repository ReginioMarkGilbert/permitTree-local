import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Upload, Trash2 } from 'lucide-react';
import '@/components/ui/styles/customScrollBar.css';

const COVEditForm = ({ formData, handleInputChange, handleFileChange, removeFile, removeAllFiles }) => {
  const renderFileInputs = () => {
    const fileTypes = [
      'letterOfIntent', 'tallySheet', 'forestCertification',
      'orCr', 'driverLicense', 'specialPowerOfAttorney'
    ];

    return fileTypes.map(type => (
      <div key={type} className="mb-4">
        <Label htmlFor={type} className="block mb-2">
          {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
        </Label>
        <div>
          {formData.files && formData.files[type] && formData.files[type].length > 0 ? (
            <>
              {formData.files[type].map((file, index) => (
                <div key={index} className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
                  <span className="text-sm text-gray-600 truncate">{file.filename}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(type, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeAllFiles(type)}
                className="mt-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove All
              </Button>
            </>
          ) : (
            <div className="mb-2 bg-gray-100 p-2 rounded">
              <span className="text-sm text-gray-500">No uploaded file</span>
            </div>
          )}
          <div className="flex items-center mt-2">
            <Input
              id={`${type}-${formData.files?.[type]?.length || 0}`}
              name={type}
              type="file"
              onChange={(e) => handleFileChange(e, type)}
              className="hidden"
            />
            <Label htmlFor={`${type}-${formData.files?.[type]?.length || 0}`} className="cursor-pointer flex items-center justify-center w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <Upload className="mr-2 h-4 w-4" />
              {formData.files && formData.files[type] && formData.files[type].length > 0
                ? `Add Another ${type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}`
                : `Upload ${type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}`
              }
            </Label>
          </div>
        </div>
      </div>
    ));
  };

  console.log('COVEditForm rendered with formData:', formData);

  return (
    <div className="pl-2 space-y-4 custom-scrollbar pr-4" style={{ maxHeight: 'calc(80vh - 200px)', overflowY: 'auto' }}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={(e) => {
            handleInputChange(e);
            console.log('Name changed to:', e.target.value);
          }}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="cellphone">Cellphone</Label>
        <Input
          id="cellphone"
          name="cellphone"
          value={formData.cellphone || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea
          id="purpose"
          name="purpose"
          value={formData.purpose || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="driverName">Driver Name</Label>
        <Input
          id="driverName"
          name="driverName"
          value={formData.driverName || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="driverLicenseNumber">Driver License Number</Label>
        <Input
          id="driverLicenseNumber"
          name="driverLicenseNumber"
          value={formData.driverLicenseNumber || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
        <Input
          id="vehiclePlateNumber"
          name="vehiclePlateNumber"
          value={formData.vehiclePlateNumber || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="originAddress">Origin Address</Label>
        <Input
          id="originAddress"
          name="originAddress"
          value={formData.originAddress || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="destinationAddress">Destination Address</Label>
        <Input
          id="destinationAddress"
          name="destinationAddress"
          value={formData.destinationAddress || ''}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Documents</h3>
        {renderFileInputs()}
      </div>
    </div>
  );
};

export default COVEditForm;
