import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { usePaymentProcess } from './hooks/usePaymentProcess';
import PaymentStepIndicator from './components/PaymentPageComponents/PaymentStepIndicator';
import PaymentInformationStep from './components/PaymentPageComponents/PaymentInformationStep';
import BillingDetailsStep from './components/PaymentPageComponents/BillingDetailsStep';
import PaymentSummaryStep from './components/PaymentPageComponents/PaymentSummaryStep';
import GCashPaymentStep from './components/PaymentPageComponents/GCashPaymentStep';
import { toast } from 'sonner';

const GET_OOP_DETAILS = gql`
  query GetOOPDetails($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      totalAmount
      OOPstatus
      items {
        description
        amount
      }
    }
  }
`;

const PaymentPage = () => {
   const { oopId } = useParams();
   const navigate = useNavigate();
   const {
      currentStep,
      formData,
      setFormData,
      nextStep,
      prevStep,
      handlePayment
   } = usePaymentProcess(oopId);

   const { loading, error, data } = useQuery(GET_OOP_DETAILS, {
      variables: { id: oopId },
      fetchPolicy: 'network-only'
   });

   useEffect(() => {
      if (error) {
         toast.error("Error loading payment details");
         navigate('/applicationsStatus');
      }
   }, [error, navigate]);

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
         </div>
      );
   }

   const oop = data?.getOOPById;

   if (!oop) {
      return null;
   }

   const renderStep = () => {
      switch (currentStep) {
         case 1:
            return (
               <PaymentInformationStep
                  oop={oop}
                  onNext={nextStep}
               />
            );
         case 2:
            return (
               <BillingDetailsStep
                  formData={formData}
                  setFormData={setFormData}
                  onNext={nextStep}
                  onBack={prevStep}
               />
            );
         case 3:
            return (
               <PaymentSummaryStep
                  oop={oop}
                  formData={formData}
                  onNext={async () => {
                     try {
                        await handlePayment();
                        nextStep();
                     } catch (error) {
                        toast.error("Payment processing failed. Please try again.");
                     }
                  }}
                  onBack={prevStep}
               />
            );
         case 4:
            return (
               <GCashPaymentStep
                  oop={oop}
                  onBack={prevStep}
               />
            );
         default:
            return null;
      }
   };

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
         <div className="w-full max-w-4xl pt-24 px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg shadow-sm p-6 mb-8">
               <PaymentStepIndicator currentStep={currentStep} />
            </div>
            <div className="flex justify-center">
               {renderStep()}
            </div>
         </div>
      </div>
   );
};

export default PaymentPage;
