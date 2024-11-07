import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaymentSummaryStep = ({ oop, formData, onNext, onBack }) => {
   return (
      <Card className="w-full max-w-2xl mx-auto">
         <CardHeader>
            <CardTitle className="text-center">Payment Summary</CardTitle>
         </CardHeader>
         <CardContent className="space-y-6">
            <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Order Details</h3>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bill Number:</span>
                        <span className="text-gray-900">{oop?.billNo}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Application Number:</span>
                        <span className="text-gray-900">{oop?.applicationId}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount:</span>
                        <span className="text-gray-900">₱ {oop?.totalAmount?.toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Billing Information</h3>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Full Name:</span>
                        <span className="text-gray-900">{formData.fullName}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-900">{formData.email}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phone Number:</span>
                        <span className="text-gray-900">{formData.phoneNumber}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Address:</span>
                        <span className="text-gray-900">{formData.address}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-between pt-4">
               <Button type="button" variant="outline" onClick={onBack}>
                  Back
               </Button>
               <Button
                  onClick={onNext}
                  className="bg-green-600 hover:bg-green-700"
               >
                  Proceed to Payment
               </Button>
            </div>
         </CardContent>
      </Card>
   );
};

export default PaymentSummaryStep;
