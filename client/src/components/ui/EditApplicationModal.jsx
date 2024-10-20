import React, { useState, useEffect } from 'react';
import { X, FileText, Trash2, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import './styles/customScrollBar.css';

const EditApplicationModal = ({ isOpen, onClose, application, onUpdate }) => {
   const [formData, setFormData] = useState({});
   const [files, setFiles] = useState({});

   const chainsawStores = [
      { value: "Green Chainsaw Co.", label: "Green Chainsaw Co." },
      { value: "Forest Tools Inc.", label: "Forest Tools Inc." },
      { value: "EcoSaw Supplies", label: "EcoSaw Supplies" },
      { value: "Timber Tech Equipment", label: "Timber Tech Equipment" },
      { value: "Woodland Machinery", label: "Woodland Machinery" }
   ];

   const registrationTypes = [
      { value: "New", label: "New Registration" },
      { value: "Renewal", label: "Renewal" }
   ];

   useEffect(() => {
      if (application) {
         setFormData({
            customId: application.customId,
            registrationType: application.registrationType,
            chainsawStore: application.chainsawStore,
            ownerName: application.ownerName,
            address: application.address,
            phone: application.phone,
            brand: application.brand,
            model: application.model,
            serialNumber: application.serialNumber,
            dateOfAcquisition: application.dateOfAcquisition.split('T')[0],
            powerOutput: application.powerOutput,
            maxLengthGuidebar: application.maxLengthGuidebar,
            countryOfOrigin: application.countryOfOrigin,
            purchasePrice: application.purchasePrice,
         });
         setFiles(application.files || {});
      }
   }, [application]);

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleFileChange = (e, documentType) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (event) => {
            const newFiles = { ...files };
            if (!newFiles[documentType]) {
               newFiles[documentType] = [];
            }
            newFiles[documentType].push({
               filename: file.name,
               data: event.target.result.split(',')[1], // Base64 encoded file data
               contentType: file.type
            });
            setFiles(newFiles);
         };
         reader.readAsDataURL(file);
      }
   };

   const removeFile = (documentType, index) => {
      const newFiles = { ...files };
      newFiles[documentType].splice(index, 1);
      if (newFiles[documentType].length === 0) {
         delete newFiles[documentType];
      }
      setFiles(newFiles);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const dataToSend = {
            registrationType: formData.registrationType,
            chainsawStore: formData.chainsawStore,
            ownerName: formData.ownerName,
            address: formData.address,
            phone: formData.phone,
            brand: formData.brand,
            model: formData.model,
            serialNumber: formData.serialNumber,
            dateOfAcquisition: formData.dateOfAcquisition,
            powerOutput: formData.powerOutput,
            maxLengthGuidebar: formData.maxLengthGuidebar,
            countryOfOrigin: formData.countryOfOrigin,
            purchasePrice: parseFloat(formData.purchasePrice),
            isOwner: formData.isOwner,
            isTenureHolder: formData.isTenureHolder,
            isBusinessOwner: formData.isBusinessOwner,
            isPLTPRHolder: formData.isPLTPRHolder,
            isWPPHolder: formData.isWPPHolder,
            files: files
         };

         await onUpdate(application._id, dataToSend);
         onClose();
         toast.success('Application updated successfully');
      } catch (error) {
         console.error('Error updating application:', error);
         toast.error(`Error updating application: ${error.message || 'Unknown error occurred'}`);
      }
   };

   const formatDocumentLabel = (key) => {
      const labels = {
         officialReceipt: "Official Receipt",
         deedOfSale: "Deed of Sale",
         specialPowerOfAttorney: "Special Power of Attorney",
         forestTenureAgreement: "Forest Tenure Agreement",
         businessPermit: "Business Permit",
         certificateOfRegistration: "Certificate of Registration",
         woodProcessingPlantPermit: "Wood Processing Plant Permit"
      };
      return labels[key] || key.replace(/([A-Z])/g, ' $1').trim();
   };

   const getRequiredDocuments = () => {
      const documents = ['officialReceipt', 'deedOfSale'];
      if (formData.isOwner) documents.push('specialPowerOfAttorney');
      if (formData.isTenureHolder) documents.push('forestTenureAgreement');
      if (formData.isBusinessOwner) documents.push('businessPermit');
      if (formData.isPLTPRHolder) documents.push('certificateOfRegistration');
      if (formData.isWPPHolder) documents.push('woodProcessingPlantPermit');
      return documents;
   };

   if (!isOpen || !application) return null;

   const requiredDocuments = getRequiredDocuments();

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-20">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
               <h2 className="text-xl font-semibold">Edit Chainsaw Registration</h2>
               <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors duration-200">
                  <X size={20} />
               </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
               <Section title="Application Information">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Application ID</label>
                     <input
                        type="text"
                        value={formData.customId || ''}
                        readOnly
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                     />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type</label>
                     <select
                        name="registrationType"
                        value={formData.registrationType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                     >
                        <option value="" disabled>Select registration type</option>
                        {registrationTypes.map((type) => (
                           <option key={type.value} value={type.value}>
                              {type.label}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Chainsaw Store</label>
                     <select
                        name="chainsawStore"
                        value={formData.chainsawStore}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                     >
                        <option value="" disabled>Select a store</option>
                        {chainsawStores.map((store) => (
                           <option key={store.value} value={store.value}>
                              {store.label}
                           </option>
                        ))}
                     </select>
                  </div>
               </Section>

               <Section title="Owner Information">
                  <Field label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} />
                  <Field label="Address" name="address" value={formData.address} onChange={handleChange} />
                  <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
               </Section>

               <Section title="Chainsaw Details">
                  <Field label="Brand" name="brand" value={formData.brand} onChange={handleChange} />
                  <Field label="Model" name="model" value={formData.model} onChange={handleChange} />
                  <Field label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} />
                  <Field label="Power Output" name="powerOutput" value={formData.powerOutput} onChange={handleChange} />
                  <Field label="Max Length Guidebar" name="maxLengthGuidebar" value={formData.maxLengthGuidebar} onChange={handleChange} />
                  <Field label="Country of Origin" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} />
                  <Field label="Purchase Price" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} type="number" />
               </Section>

               <Section title="Dates">
                  <Field label="Date of Acquisition" name="dateOfAcquisition" value={formData.dateOfAcquisition} onChange={handleChange} type="date" />
               </Section>

               <Section title="Documents">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-2">
                     {requiredDocuments.map(documentType => (
                        <div key={documentType} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                           <h4 className="font-semibold text-gray-700 mb-2">{formatDocumentLabel(documentType)}</h4>
                           {files[documentType] && files[documentType].map((file, index) => (
                              <div key={index} className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
                                 <div className="flex items-center overflow-hidden">
                                    <FileText size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 truncate">{file.filename}</span>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={() => removeFile(documentType, index)}
                                    className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           ))}
                           <label className="flex items-center justify-center w-full px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 transition-colors mt-2">
                              <Upload size={16} className="mr-2" />
                              <span>Add {formatDocumentLabel(documentType)}</span>
                              <input
                                 type="file"
                                 onChange={(e) => handleFileChange(e, documentType)}
                                 className="hidden"
                              />
                           </label>
                        </div>
                     ))}
                  </div>
               </Section>
            </form>
            <div className="p-5 bg-gray-50 flex justify-end rounded-b-2xl">
               <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2"
               >
                  Cancel
               </button>
               <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 shadow-md hover:shadow-lg"
               >
                  Save Changes
               </button>
            </div>
         </div>
      </div>
   );
};

function Section({ title, children }) {
   return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
         <h3 className="text-lg font-semibold text-gray-700 mb-2 px-4 pt-4">{title}</h3>
         <div className="bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-b-xl">
            {children}
         </div>
      </div>
   );
}

function Field({ label, name, value, onChange, type = "text" }) {
   return (
      <div className="bg-white p-3 rounded-lg shadow-sm">
         <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
         <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
         />
      </div>
   );
}

export default EditApplicationModal;
