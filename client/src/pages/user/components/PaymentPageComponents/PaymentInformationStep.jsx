import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PaymentInformationStep = ({ oop, onNext }) => {
   return (
      <Card className="w-full max-w-2xl mx-auto">
         <CardHeader>
            <CardTitle className="text-center">Payment Information</CardTitle>
         </CardHeader>
         <CardContent className="space-y-6">
            <div className="text-center">
               <h2 className="text-2xl font-semibold text-gray-900">
                  ₱ {oop?.totalAmount?.toFixed(2)}
               </h2>
               <p className="text-sm text-gray-500 mt-1">Amount to Pay</p>
            </div>

            <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">Order Details</h3>
                  <div className="mt-2 space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bill Number:</span>
                        <span className="text-gray-900">{oop?.billNo}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Application Number:</span>
                        <span className="text-gray-900">{oop?.applicationNumber}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Applicant ID:</span>
                        <span className="text-gray-900">{oop?.applicationId}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-4">
               <Button onClick={onNext} className="bg-green-600 hover:bg-green-700">
                  Continue
               </Button>
            </div>
         </CardContent>
      </Card>
   );
};

export default PaymentInformationStep;
