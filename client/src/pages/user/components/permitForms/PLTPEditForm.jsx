import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Upload } from 'lucide-react';
import '@/components/ui/styles/customScrollBar.css';

const PLTPEditForm = ({ formData, handleInputChange, handleCheckboxChange, handleFileChange, removeFile }) => {
   const renderFileInputs = () => {
      const fileTypes = [
         { type: 'letterOfIntent', label: 'Letter of Intent', condition: true },
         { type: 'lguEndorsement', label: 'LGU Endorsement', condition: true },
         { type: 'titleCertificate', label: 'Title Certificate', condition: true },
         { type: 'darCertificate', label: 'DAR Certificate', condition: true },
         { type: 'specialPowerOfAttorney', label: 'Special Power of Attorney', condition: true },
         { type: 'ptaResolution', label: 'PTA Resolution', condition: true }
      ];

      return fileTypes.filter(fileType => fileType.condition).map(({ type, label }) => (
         <div key={type} className="mb-4">
            <Label htmlFor={type} className="block mb-2">
               {label}
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
                        ? `Add Another ${label}`
                        : `Upload ${label}`
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

         <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">Tree Type</Label>
            <div className="flex items-center space-x-2">
               <Checkbox
                  id="plantedTrees"
                  checked={formData.plantedTrees}
                  onCheckedChange={() => handleCheckboxChange('plantedTrees')}
               />
               <Label htmlFor="plantedTrees">Planted Trees</Label>
            </div>
            <div className="flex items-center space-x-2">
               <Checkbox
                  id="naturallyGrown"
                  checked={formData.naturallyGrown}
                  onCheckedChange={() => handleCheckboxChange('naturallyGrown')}
               />
               <Label htmlFor="naturallyGrown">Naturally Grown</Label>
            </div>
         </div>

         <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">Tree Status</Label>
            <div className="flex items-center space-x-2">
               <Checkbox
                  id="standing"
                  checked={formData.standing}
                  onCheckedChange={() => handleCheckboxChange('standing')}
               />
               <Label htmlFor="standing">Standing</Label>
            </div>
            <div className="flex items-center space-x-2">
               <Checkbox
                  id="blownDown"
                  checked={formData.blownDown}
                  onCheckedChange={() => handleCheckboxChange('blownDown')}
               />
               <Label htmlFor="blownDown">Blown Down</Label>
            </div>
         </div>

         <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">Land Type</Label>
            <div className="flex items-center space-x-2">
               <Checkbox
                  id="withinPrivateLand"
                  checked={formData.withinPrivateLand}
                  onCheckedChange={() => handleCheckboxChange('withinPrivateLand')}
               />
               <Label htmlFor="withinPrivateLand">Within Private Land</Label>
            </div>
            <div className="flex items-center space-x-2">
               <Checkbox
                  id="withinTenuredForestLand"
                  checked={formData.withinTenuredForestLand}
                  onCheckedChange={() => handleCheckboxChange('withinTenuredForestLand')}
               />
               <Label htmlFor="withinTenuredForestLand">Within Tenured Forest Land</Label>
            </div>
         </div>

         <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">Additional Characteristics</Label>
            <div className="flex items-center space-x-2">
               <Checkbox
                  id="posingDanger"
                  checked={formData.posingDanger}
                  onCheckedChange={() => handleCheckboxChange('posingDanger')}
               />
               <Label htmlFor="posingDanger">Posing Danger</Label>
            </div>
            <div className="flex items-center space-x-2">
               <Checkbox
                  id="forPersonalUse"
                  checked={formData.forPersonalUse}
                  onCheckedChange={() => handleCheckboxChange('forPersonalUse')}
               />
               <Label htmlFor="forPersonalUse">For Personal Use</Label>
            </div>
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

export default PLTPEditForm;
