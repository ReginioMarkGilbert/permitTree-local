import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Upload } from 'lucide-react';
import '@/components/ui/styles/customScrollBar.css';
import { format, parse } from 'date-fns';

const PTPREditForm = ({ formData, handleInputChange, handleFileChange, removeFile }) => {
   const renderFileInputs = () => {
      const fileTypes = [
         { type: 'letterRequest', label: 'Letter Request', condition: true },
         { type: 'titleOrTaxDeclaration', label: 'Title or Tax Declaration', condition: true },
         { type: 'darCertification', label: 'DAR Certification', condition: true },
         { type: 'specialPowerOfAttorney', label: 'Special Power of Attorney', condition: true }
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

   const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(parseInt(dateString));
      return format(date, 'yyyy-MM-dd');
   };

   const handleDateChange = (e) => {
      const { name, value } = e.target;
      const date = parse(value, 'yyyy-MM-dd', new Date());
      handleInputChange({
         target: {
            name,
            value: date.getTime().toString()
         }
      });
   };

   return (
      <div className="pl-2 space-y-4 custom-scrollbar pr-4" style={{ maxHeight: 'calc(80vh - 200px)', overflowY: 'auto' }}>
         <div>
            <Label htmlFor="ownerName">Name of Lot Owner</Label>
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
            <Label htmlFor="lotArea">Lot area devoted to plantation (in hectares)</Label>
            <Input
               id="lotArea"
               name="lotArea"
               type="number"
               step="0.01"
               value={formData.lotArea || ''}
               onChange={handleInputChange}
               required
            />
         </div>
         <div>
            <Label htmlFor="treeSpecies">Tree Species Planted (comma-separated)</Label>
            <Input
               id="treeSpecies"
               name="treeSpecies"
               value={formData.treeSpecies ? formData.treeSpecies.join(', ') : ''}
               onChange={(e) => handleInputChange({
                  target: {
                     name: 'treeSpecies',
                     value: e.target.value.split(',').map(s => s.trim())
                  }
               })}
               required
            />
         </div>
         <div>
            <Label htmlFor="totalTrees">Total No. of Trees Planted</Label>
            <Input
               id="totalTrees"
               name="totalTrees"
               type="number"
               value={formData.totalTrees || ''}
               onChange={handleInputChange}
               required
            />
         </div>
         <div>
            <Label htmlFor="treeSpacing">Spacing of trees</Label>
            <Input
               id="treeSpacing"
               name="treeSpacing"
               value={formData.treeSpacing || ''}
               onChange={handleInputChange}
               required
            />
         </div>
         <div>
            <Label htmlFor="yearPlanted">Year Planted</Label>
            <Input
               id="yearPlanted"
               name="yearPlanted"
               type="number"
               value={formData.yearPlanted || ''}
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

export default PTPREditForm;
