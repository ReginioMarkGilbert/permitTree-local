import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Upload } from 'lucide-react';
import '@/components/ui/styles/customScrollBar.css';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const TCEBPEditForm = ({ formData, handleInputChange, handleFileChange, removeFile }) => {
   const renderFileInputs = () => {
      const fileTypes = [
         'letterOfIntent', 'lguEndorsement', 'landTenurial', 'siteDevelopmentPlan',
         'environmentalCompliance', 'fpic', 'ownerConsent', 'pambClearance'
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

   return (
      <div className="pl-2 space-y-4 custom-scrollbar pr-4" style={{ maxHeight: 'calc(80vh - 200px)', overflowY: 'auto' }}>
         <div>
            <Label htmlFor="requestType">Request Type</Label>
            <RadioGroup
               name="requestType"
               value={formData.requestType}
               onValueChange={(value) => handleInputChange({ target: { name: 'requestType', value } })}
            >
               <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Cutting" id="Cutting" />
                  <Label htmlFor="Cutting">Request for Cutting/Earth balling (NGA's)</Label>
               </div>
               <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Inventory" id="Inventory" />
                  <Label htmlFor="Inventory">Request for Inventory for Cutting/Earth Balling (NGA'S)</Label>
               </div>
            </RadioGroup>
         </div>
         <div>
            <Label htmlFor="name">Name</Label>
            <Input
               id="name"
               name="name"
               value={formData.name || ''}
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
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
               id="contactNumber"
               name="contactNumber"
               value={formData.contactNumber || ''}
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

         <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Documents</h3>
            {renderFileInputs()}
         </div>
      </div>
   );
};

export default TCEBPEditForm;
