import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Upload } from 'lucide-react';
import '@/components/ui/styles/customScrollbar.css';
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO, isValid } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CSAWEditForm = ({ formData, handleInputChange, handleFileChange, removeFile, handleCheckboxChange }) => {
  const [customStore, setCustomStore] = useState('');

  useEffect(() => {
    if (formData.chainsawStore && !chainsawStores.some(store => store.value === formData.chainsawStore)) {
      setCustomStore(formData.chainsawStore);
    }
  }, [formData.chainsawStore]);

  const chainsawStores = [
    { value: "Green Chainsaw Co.", label: "Green Chainsaw Co." },
    { value: "Forest Tools Inc.", label: "Forest Tools Inc." },
    { value: "EcoSaw Supplies", label: "EcoSaw Supplies" },
    { value: "Timber Tech Equipment", label: "Timber Tech Equipment" },
    { value: "Woodland Machinery", label: "Woodland Machinery" },
    { value: "other", label: "Other (not listed)" }
  ];

  const handleStoreChange = (value) => {
    if (value === "other") {
      handleInputChange({ target: { name: "chainsawStore", value: customStore } });
    } else {
      handleInputChange({ target: { name: "chainsawStore", value } });
    }
  };

  const renderFileInputs = () => {
    const fileTypes = [
      'officialReceipt', 'deedOfSale', 'specialPowerOfAttorney',
      'forestTenureAgreement', 'businessPermit', 'certificateOfRegistration',
      'woodProcessingPlantPermit'
    ];

    return fileTypes.map(type => (
      <div key={type} className="mb-4">
        <Label htmlFor={type} className="block mb-2">
          {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
        </Label>
        <div>
          {formData.files && formData.files[type] && formData.files[type].length > 0 ? (
            formData.files[type].map((file, index) => (
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
            ))
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

  const formatDate = (dateString) => {
    if (!dateString) return '';

    let date;

    // Check if the dateString is a number (timestamp)
    if (!isNaN(dateString)) {
      date = new Date(parseInt(dateString));
    } else {
      // Try parsing as ISO string
      date = parseISO(dateString);
    }

    // If not valid, try creating a new Date object
    if (!isValid(date)) {
      date = new Date(dateString);
    }

    // If still not valid, return empty string
    if (!isValid(date)) {
      console.error('Invalid date:', dateString);
      return '';
    }

    // Format the date
    return format(date, 'yyyy-MM-dd');
  };

  console.log('CSAWEditForm rendered with formData:', formData);

  return (
    <div className="pl-2 space-y-4 custom-scrollbar pr-4" style={{ maxHeight: 'calc(80vh - 200px)', overflowY: 'auto' }}>
      <div>
        <Label htmlFor="registrationType">Registration Type</Label>
        <Input
          id="registrationType"
          name="registrationType"
          value={formData.registrationType || ''}
          readOnly
          className="bg-gray-100"
        />
      </div>
      <div>
        <Label htmlFor="chainsawStore">Chainsaw Store</Label>
        <Select
          value={chainsawStores.some(store => store.value === formData.chainsawStore) ? formData.chainsawStore : "other"}
          onValueChange={handleStoreChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Chainsaw Store" />
          </SelectTrigger>
          <SelectContent>
            {chainsawStores.map((store) => (
              <SelectItem key={store.value} value={store.value}>
                {store.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.chainsawStore === "other" && (
          <Input
            className="mt-2"
            placeholder="Enter Chainsaw Store"
            value={customStore}
            onChange={(e) => {
              setCustomStore(e.target.value);
              handleInputChange({ target: { name: "chainsawStore", value: e.target.value } });
            }}
          />
        )}
      </div>
      <div>
        <Label htmlFor="ownerName">Owner Name</Label>
        <Input
          id="ownerName"
          name="ownerName"
          value={formData.ownerName || ''}
          onChange={handleInputChange}
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
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="brand">Brand</Label>
        <Input
          id="brand"
          name="brand"
          value={formData.brand || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          name="model"
          value={formData.model || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input
          id="serialNumber"
          name="serialNumber"
          value={formData.serialNumber || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="dateOfAcquisition">Date of Acquisition</Label>
        <Input
          id="dateOfAcquisition"
          name="dateOfAcquisition"
          type="date"
          value={formatDate(formData.dateOfAcquisition)}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="powerOutput">Power Output</Label>
        <Input
          id="powerOutput"
          name="powerOutput"
          value={formData.powerOutput || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="maxLengthGuidebar">Max Length Guidebar</Label>
        <Input
          id="maxLengthGuidebar"
          name="maxLengthGuidebar"
          value={formData.maxLengthGuidebar || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="countryOfOrigin">Country of Origin</Label>
        <Input
          id="countryOfOrigin"
          name="countryOfOrigin"
          value={formData.countryOfOrigin || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="purchasePrice">Purchase Price</Label>
        <Input
          id="purchasePrice"
          name="purchasePrice"
          type="number"
          value={formData.purchasePrice || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isOwner"
            checked={formData.isOwner}
            onCheckedChange={(checked) => handleCheckboxChange('isOwner', checked)}
          />
          <Label htmlFor="isOwner">Is Owner</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isTenureHolder"
            checked={formData.isTenureHolder}
            onCheckedChange={(checked) => handleCheckboxChange('isTenureHolder', checked)}
          />
          <Label htmlFor="isTenureHolder">Is Tenure Holder</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isBusinessOwner"
            checked={formData.isBusinessOwner}
            onCheckedChange={(checked) => handleCheckboxChange('isBusinessOwner', checked)}
          />
          <Label htmlFor="isBusinessOwner">Is Business Owner</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPLTPRHolder"
            checked={formData.isPLTPRHolder}
            onCheckedChange={(checked) => handleCheckboxChange('isPLTPRHolder', checked)}
          />
          <Label htmlFor="isPLTPRHolder">Is PLTPR Holder</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isWPPHolder"
            checked={formData.isWPPHolder}
            onCheckedChange={(checked) => handleCheckboxChange('isWPPHolder', checked)}
          />
          <Label htmlFor="isWPPHolder">Is WPP Holder</Label>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">Documents</h3>
        {renderFileInputs()}
      </div>
    </div>
  );
};

export default CSAWEditForm;
