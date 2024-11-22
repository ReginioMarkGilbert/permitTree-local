import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BillingDetailsStep = ({ formData, setFormData, onNext, onBack }) => {
   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      onNext();
   };

   return (
      <Card data-testid="billing-details-step" className="w-full max-w-2xl mx-auto">
         <CardHeader>
            <CardTitle className="text-center">Billing Details</CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-4">
                  <div>
                     <Label htmlFor="fullName">Full Name</Label>
                     <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                     />
                  </div>

                  <div>
                     <Label htmlFor="email">Email Address</Label>
                     <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                     />
                  </div>

                  <div>
                     <Label htmlFor="phoneNumber">Phone Number</Label>
                     <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        required
                     />
                  </div>

                  <div>
                     <Label htmlFor="address">Complete Address</Label>
                     <Input
                        id="address"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your complete address"
                        required
                     />
                  </div>
               </div>

               <div className="flex justify-between gap-4">
                  <Button
                     data-testid="back-button"
                     variant="outline"
                     onClick={onBack}
                  >
                     Back
                  </Button>
                  <Button
                     data-testid="next-button"
                     onClick={onNext}
                  >
                     Next
                  </Button>
               </div>
            </form>
         </CardContent>
      </Card>
   );
};

export default BillingDetailsStep;
