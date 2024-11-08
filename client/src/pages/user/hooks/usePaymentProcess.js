import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($oopId: ID!, $method: String!) {
    initiatePayment(oopId: $oopId, method: $method) {
      id
      status
      amount
      paymentMethod
      createdAt
      expiresAt
    }
  }
`;

const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($oopId: ID!, $reference: String!) {
    confirmPayment(oopId: $oopId, reference: $reference) {
      success
      message
      transactionId
      paymentStatus
    }
  }
`;

export const usePaymentProcess = (oopId) => {
   const [currentStep, setCurrentStep] = useState(1);
   const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
   });

   const [initiatePayment] = useMutation(INITIATE_PAYMENT);
   const [confirmPayment] = useMutation(CONFIRM_PAYMENT);

   const handlePayment = async () => {
      try {
         // First initiate the payment
         const { data: initiateData } = await initiatePayment({
            variables: {
               oopId,
               method: 'GCASH'
            }
         });

         if (initiateData?.initiatePayment) {
            // Then simulate payment completion
            const { data: confirmData } = await confirmPayment({
               variables: {
                  oopId,
                  reference: `PAY-${Date.now()}`
               }
            });
            console.log('confirmData', confirmData);
            return confirmData.confirmPayment;
         }
      } catch (error) {
         console.error('Payment processing error:', error);
         throw error;
      }
   };

   const nextStep = () => setCurrentStep(prev => prev + 1);
   const prevStep = () => setCurrentStep(prev => prev - 1);

   return {
      currentStep,
      formData,
      setFormData,
      nextStep,
      prevStep,
      handlePayment
   };
};
