import { useState } from 'react';
import { gql, useMutation, useApolloClient } from '@apollo/client';

const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($oopId: ID!, $method: String!, $paymentDetails: PaymentDetailsInput!) {
    initiatePayment(oopId: $oopId, method: $method, paymentDetails: $paymentDetails) {
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
   const client = useApolloClient();
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
         // First initiate the payment with payment details
         const { data: initiateData } = await initiatePayment({
            variables: {
               oopId,
               method: 'GCASH',
               paymentDetails: {
                  fullName: formData.fullName,
                  email: formData.email,
                  phoneNumber: formData.phoneNumber,
                  address: formData.address
               }
            }
         });

         if (initiateData?.initiatePayment) {
            // Then confirm the payment
            const { data: confirmData } = await confirmPayment({
               variables: {
                  oopId,
                  reference: `PAY-${Date.now()}`
               }
            });

            if (confirmData?.confirmPayment?.success) {
               return confirmData.confirmPayment;
            } else {
               throw new Error(confirmData?.confirmPayment?.message || 'Payment failed');
            }
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
