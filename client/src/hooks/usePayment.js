import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { toast } from 'sonner';

const GET_PAYMENTS = gql`
  query GetPayments($status: String) {
    getPayments(status: $status) {
      id
      oopId
      status
      amount
      paymentMethod
      transactionId
      paymentDetails {
        fullName
        email
        phoneNumber
        address
      }
      createdAt
      updatedAt
    }
  }
`;

const VERIFY_PAYMENT = gql`
  mutation VerifyPayment($paymentId: ID!, $status: String!) {
    verifyPayment(paymentId: $paymentId, status: $status) {
      success
      message
      payment {
        id
        status
      }
    }
  }
`;

export const usePayment = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_PAYMENTS, {
    variables: { status: "Payment Proof Submitted" },
    fetchPolicy: 'network-only'
  });

  const [verifyPayment] = useMutation(VERIFY_PAYMENT);

  const handleVerifyPayment = async (paymentId, status) => {
    try {
      const { data } = await verifyPayment({
        variables: { paymentId, status }
      });

      if (data.verifyPayment.success) {
        toast.success(data.verifyPayment.message);
        refetch();
      } else {
        toast.error(data.verifyPayment.message);
      }
    } catch (error) {
      toast.error('Failed to verify payment');
      console.error('Error verifying payment:', error);
    }
  };

  return {
    payments: data?.getPayments || [],
    loading,
    error,
    selectedPayment,
    setSelectedPayment,
    handleVerifyPayment,
    refetch
  };
};
