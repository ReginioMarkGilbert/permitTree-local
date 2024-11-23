// form for creating order of payment - multi step form
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, MinusIcon, UploadIcon, ArrowLeft, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import "@/components/ui/styles/customScrollBar.css";
import { useOrderOfPayments } from '../hooks/useOrderOfPayments';
import { cn } from "@/lib/utils";
import { ChevronDown } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const CustomSelect = ({ options, onSelect, placeholder }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [selected, setSelected] = useState(null);

   const handleSelect = (option) => {
      setSelected(option);
      onSelect(option.id);
      setIsOpen(false);
   };

   return (
      <div className="relative">
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
               "flex h-10 w-full items-center justify-between rounded-md border border-input",
               "bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
               "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
               "disabled:cursor-not-allowed disabled:opacity-50"
            )}
         >
            <span>{selected ? `${selected.applicationNumber} - ${selected.ownerName || selected.name}` : placeholder}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
         </button>

         {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
               <div className="py-1 max-h-60 overflow-auto">
                  {options.map((option) => (
                     <button
                        key={option.id}
                        type="button"
                        className={cn(
                           "w-full px-3 py-2 text-left text-sm hover:bg-gray-100",
                           selected?.id === option.id && "bg-gray-100"
                        )}
                        onClick={() => handleSelect(option)}
                     >
                        {option.applicationNumber} - {option.ownerName || option.name}
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};

const OrderOfPaymentForm = ({ onClose }) => {
   const navigate = useNavigate();
   const isMobile = useMediaQuery('(max-width: 640px)');

   const {
      applications,
      applicationsLoading,
      applicationsError,
      createOOP,
      updateSignature
   } = useOrderOfPayments();

   const [step, setStep] = useState(1);
   const [formData, setFormData] = useState({
      applicationId: '',
      applicationNumber: '',
      applicantName: '',
      billNo: '',
      date: new Date(),
      namePayee: '',
      address: '',
      natureOfApplication: '',
      fees: [{ id: 1, legalBasis: '', description: '', amount: '' }],
      rpsSignature: null,
      tsdSignature: null
   });

   const rpsFileInputRef = useRef(null);
   const tsdFileInputRef = useRef(null);

   const handleApplicationSelect = (applicationId) => {
      const selectedApp = applications.find(app => app.id === applicationId);
      if (selectedApp) {
         console.log('Selected application:', selectedApp);
         setFormData(prev => ({
            ...prev,
            applicationId: selectedApp.id,
            applicationNumber: selectedApp.applicationNumber,
            applicantName: selectedApp.ownerName || selectedApp.name,
            namePayee: selectedApp.ownerName || selectedApp.name,
            address: selectedApp.address,
            natureOfApplication: selectedApp.applicationType
         }));
      }
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleFeeChange = (id, field, value) => {
      setFormData(prev => ({
         ...prev,
         fees: prev.fees.map(fee =>
            fee.id === id ? { ...fee, [field]: value } : fee
         )
      }));
   };

   const addFeeRow = () => {
      setFormData(prev => ({
         ...prev,
         fees: [...prev.fees, { id: Date.now(), legalBasis: '', description: '', amount: '' }]
      }));
   };

   const removeFeeRow = (id) => {
      setFormData(prev => ({
         ...prev,
         fees: prev.fees.filter(fee => fee.id !== id)
      }));
   };

   const handleSignatureUpload = (event, signatureType) => {
      const file = event.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (e) => {
            setFormData(prev => ({ ...prev, [signatureType]: e.target.result }));
         };
         reader.readAsDataURL(file);
      }
   };

   const triggerFileInput = (e, inputRef) => {
      e.preventDefault();
      e.stopPropagation();
      inputRef.current.click();
   };

   const handleDateChange = (date, field) => {
      setFormData(prev => ({ ...prev, [field]: date }));
   };

   const handleTimeChange = (e, field) => {
      setFormData(prev => ({
         ...prev,
         [field]: e.target.value
      }));
   };

   const handleNext = () => {
      if (step === 1 && !formData.applicationId) {
         toast.error('Please select an application before proceeding.');
         return;
      }
      setStep(step + 1);
   };

   const handlePrevious = () => {
      setStep(step - 1);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         // Validate required fields
         if (!formData.applicationId || !formData.applicationNumber || !formData.namePayee || !formData.address || !formData.natureOfApplication) {
            toast.error('Please fill in all required fields');
            return;
         }

         // Validate fees
         const validFees = formData.fees.filter(fee =>
            fee.legalBasis && fee.description && fee.amount && !isNaN(parseFloat(fee.amount))
         );

         if (validFees.length === 0) {
            toast.error('Please add at least one valid fee');
            return;
         }

         // Transform the data
         const transformedData = {
            applicationId: formData.applicationId.toString(),
            applicationNumber: formData.applicationNumber,
            namePayee: formData.namePayee.trim(),
            address: formData.address.trim(),
            natureOfApplication: formData.natureOfApplication.trim(),
            items: validFees.map(fee => ({
               legalBasis: fee.legalBasis.trim(),
               description: fee.description.trim(),
               amount: parseFloat(fee.amount)
            }))
         };

         // Add signatures if they exist
         if (formData.rpsSignature) {
            transformedData.rpsSignatureImage = formData.rpsSignature;
         }
         if (formData.tsdSignature) {
            transformedData.tsdSignatureImage = formData.tsdSignature;
         }

         console.log('Submitting OOP data:', transformedData);

         const result = await createOOP(transformedData);

         if (result) {
            toast.success('Order of Payment created successfully');
            navigate('/personnel/dashboard');
         }
      } catch (error) {
         console.error('Error creating Order of Payment:', error);
         toast.error(`Failed to create Order of Payment: ${error.message}`);
      }
   };

   const handleBack = () => {
      navigate('/personnel/dashboard');
   };

   useEffect(() => {
      console.log('Applications in form:', applications);
   }, [applications]);

   const handleRemoveSignature = (signatureType, inputRef) => {
      // Clear the signature from formData
      setFormData(prev => ({ ...prev, [signatureType]: null }));

      // Reset the file input
      if (inputRef.current) {
         inputRef.current.value = '';
      }
   };

   const renderStep = () => {
      switch (step) {
         case 1:
            return (
               <div className="space-y-4">
                  <Label htmlFor="applicationSelect">Select Application</Label>
                  <div className="text-sm text-gray-500 mb-2">
                     Available applications: {applications?.length || 0}
                  </div>

                  {applicationsLoading ? (
                     <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                        Loading...
                     </div>
                  ) : (
                     <CustomSelect
                        options={applications}
                        onSelect={handleApplicationSelect}
                        placeholder="Select an application"
                     />
                  )}

                  <div className="space-y-4">
                     <div>
                        <Label htmlFor="applicationNumber">Application Number</Label>
                        <Input
                           id="applicationNumber"
                           name="applicationNumber"
                           value={formData.applicationNumber}
                           onChange={handleInputChange}
                           disabled
                        />
                     </div>
                     <div>
                        <Label htmlFor="applicationId">Application ID</Label>
                        <Input
                           id="applicationId"
                           name="applicationId"
                           value={formData.applicationId}
                           onChange={handleInputChange}
                           disabled
                        />
                     </div>
                     <div>
                        <Label htmlFor="applicantName">Applicant Name</Label>
                        <Input
                           id="applicantName"
                           name="applicantName"
                           value={formData.applicantName}
                           onChange={handleInputChange}
                           disabled
                        />
                     </div>
                  </div>
               </div>
            );
         case 2:
            return (
               <div className="space-y-6 h-[630px] flex flex-col">
                  <div className="flex-grow overflow-auto custom-scrollbar pr-4">
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <Label htmlFor="billNo">Bill No.</Label>
                              <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                                 Auto-generated
                              </div>
                           </div>
                           <div>
                              <Label>Date</Label>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left">
                                       <CalendarIcon className="mr-2 h-4 w-4" />
                                       {format(formData.date, "MMM d, yyyy")}
                                    </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0">
                                    <Calendar
                                       mode="single"
                                       selected={formData.date}
                                       onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                                       initialFocus
                                    />
                                 </PopoverContent>
                              </Popover>
                           </div>
                        </div>

                        <div>
                           <Label htmlFor="namePayee">Name/Payee</Label>
                           <Input
                              id="namePayee"
                              name="namePayee"
                              value={formData.namePayee}
                              onChange={handleInputChange}
                           />
                        </div>

                        <div>
                           <Label htmlFor="address">Address</Label>
                           <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                           />
                        </div>

                        <div>
                           <Label htmlFor="natureOfApplication">Nature of Application</Label>
                           <Input
                              id="natureOfApplication"
                              name="natureOfApplication"
                              value={formData.natureOfApplication}
                              onChange={handleInputChange}
                           />
                        </div>

                        <div>
                           <Label>Fees and Charges</Label>
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Legal Basis (DAO/SEC)</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead></TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {formData.fees.map((fee, index) => (
                                    <TableRow key={fee.id}>
                                       <TableCell>
                                          <Input
                                             value={fee.legalBasis}
                                             onChange={(e) => handleFeeChange(fee.id, 'legalBasis', e.target.value)}
                                             placeholder="e.g., DAO 2000-21"
                                          />
                                       </TableCell>
                                       <TableCell>
                                          <Input
                                             value={fee.description}
                                             onChange={(e) => handleFeeChange(fee.id, 'description', e.target.value)}
                                             placeholder="Description of fee"
                                          />
                                       </TableCell>
                                       <TableCell>
                                          <Input
                                             type="number"
                                             value={fee.amount}
                                             onChange={(e) => handleFeeChange(fee.id, 'amount', e.target.value)}
                                             placeholder="0.00"
                                          />
                                       </TableCell>
                                       <TableCell>
                                          {index > 0 && (
                                             <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFeeRow(fee.id)}
                                                className="text-red-500 hover:text-red-700"
                                             >
                                                <MinusIcon className="h-4 w-4" />
                                             </Button>
                                          )}
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>

                           <div className="flex justify-between items-center mt-4">
                              <Button variant="outline" onClick={addFeeRow} type="button">
                                 <PlusIcon className="h-4 w-4 mr-2" /> Add Fee
                              </Button>
                              <div className="flex items-center">
                                 <Label className="mr-2">Total:</Label>
                                 <div className="w-32 px-3 py-2 border rounded-md bg-gray-50">
                                    ₱ {formData.fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0).toFixed(2)}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Signature section */}
                        <div className="grid grid-cols-2 gap-8 mt-8">
                           <div className="text-center">
                              <div className="relative h-24 mb-4 border-2 border-dashed rounded-md flex items-center justify-center">
                                 {formData.rpsSignature ? (
                                    <>
                                       <img
                                          src={formData.rpsSignature}
                                          alt="RPS Signature"
                                          className="max-w-full max-h-full object-contain"
                                       />
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                                          onClick={() => handleRemoveSignature('rpsSignature', rpsFileInputRef)}
                                       >
                                          <X className="h-4 w-4 text-red-600" />
                                       </Button>
                                    </>
                                 ) : (
                                    <p className="text-gray-400">RPS Signature</p>
                                 )}
                              </div>
                              <p className="font-semibold">SIMEON R. DIAZ</p>
                              <p className="text-xs text-gray-600">SVEMS/Chief, RPS</p>
                              <input
                                 type="file"
                                 ref={rpsFileInputRef}
                                 className="hidden"
                                 accept="image/*"
                                 onChange={(e) => handleSignatureUpload(e, 'rpsSignature')}
                              />
                              <Button
                                 variant="outline"
                                 size="sm"
                                 className="mt-2"
                                 onClick={(e) => triggerFileInput(e, rpsFileInputRef)}
                              >
                                 <UploadIcon className="h-4 w-4 mr-2" />
                                 Upload Signature
                              </Button>
                           </div>

                           <div className="text-center">
                              <div className="relative h-24 mb-4 border-2 border-dashed rounded-md flex items-center justify-center">
                                 {formData.tsdSignature ? (
                                    <>
                                       <img
                                          src={formData.tsdSignature}
                                          alt="TSD Signature"
                                          className="max-w-full max-h-full object-contain"
                                       />
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                                          onClick={() => handleRemoveSignature('tsdSignature', tsdFileInputRef)}
                                       >
                                          <X className="h-4 w-4 text-red-600" />
                                       </Button>
                                    </>
                                 ) : (
                                    <p className="text-gray-400">TSD Signature</p>
                                 )}
                              </div>
                              <p className="font-semibold">Engr. CYNTHIA U. LOZANO</p>
                              <p className="text-xs text-gray-600">Chief, Technical Services Division</p>
                              <input
                                 type="file"
                                 ref={tsdFileInputRef}
                                 className="hidden"
                                 accept="image/*"
                                 onChange={(e) => handleSignatureUpload(e, 'tsdSignature')}
                              />
                              <Button
                                 variant="outline"
                                 size="sm"
                                 className="mt-2"
                                 onClick={(e) => triggerFileInput(e, tsdFileInputRef)}
                              >
                                 <UploadIcon className="h-4 w-4 mr-2" />
                                 Upload Signature
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            );
         default:
            return null;
      }
   };

   if (applicationsError) {
      return (
         <div className="p-4 text-red-600 bg-red-50 rounded-md">
            Error loading applications: {applicationsError.message}
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8 mt-16">
         <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
               <Button variant="ghost" onClick={handleBack} className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
               </Button>
               <h2 className="text-2xl font-bold">Create Order of Payment</h2>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
               {renderStep()}
               <div className="flex justify-between mt-6">
                  {step > 1 && (
                     <Button type="button" onClick={handlePrevious}>
                        Previous
                     </Button>
                  )}
                  {step < 2 ? (
                     <Button type="button" onClick={handleNext}>
                        Next
                     </Button>
                  ) : (
                     <Button type="button" onClick={handleSubmit}>Create Order of Payment</Button>
                  )}
               </div>
            </form>
         </div>
      </div>
   );
};

export default OrderOfPaymentForm;
