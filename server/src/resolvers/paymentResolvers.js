const Payment = require('../models/Payment');
const { OOP } = require('../models/OOP');
const FinancialAnalyticsService = require('../services/financialAnalyticsService');

const paymentResolvers = {
   Query: {
      getPayments: async (_, { status }) => {
         try {
            const query = status ? { status } : {};
            return await Payment.find(query).sort({ createdAt: -1 });
         } catch (error) {
            throw new Error(`Failed to fetch payments: ${error.message}`);
         }
      }
   },

   Mutation: {
      initiatePayment: async (_, { oopId, method, paymentDetails }) => {
         try {
            const oop = await OOP.findById(oopId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            const payment = new Payment({
               oopId,
               status: 'PENDING',
               amount: oop.totalAmount,
               paymentMethod: method,
               paymentDetails: {
                  fullName: paymentDetails.fullName,
                  email: paymentDetails.email,
                  phoneNumber: paymentDetails.phoneNumber,
                  address: paymentDetails.address
               }
            });

            await payment.save();

            // Return PaymentSession type
            return {
               id: payment._id,
               oopId: payment.oopId,
               status: payment.status,
               amount: payment.amount,
               paymentMethod: payment.paymentMethod,
               createdAt: payment.createdAt.toISOString(),
               expiresAt: payment.expiresAt.toISOString()
            };
         } catch (error) {
            throw new Error(`Failed to initiate payment: ${error.message}`);
         }
      },

      confirmPayment: async (_, { oopId, reference }) => {
         try {
            const oop = await OOP.findById(oopId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            // Update the payment status
            const payment = await Payment.findOneAndUpdate(
               { oopId },
               {
                  status: 'COMPLETED',
                  transactionId: reference
               },
               { new: true }
            );

            // Generate payment proof
            const paymentProof = {
               transactionId: reference,
               paymentMethod: 'GCASH',
               amount: oop.totalAmount,
               referenceNumber: `GCASH-${Date.now()}`,
               timestamp: new Date(),
               payerDetails: payment.paymentDetails,
               status: 'SUBMITTED'
            };

            // Update the OOP with payment proof and status
            await OOP.findByIdAndUpdate(oopId, {
               OOPstatus: 'Payment Proof Submitted',
               paymentProof: paymentProof
            });

            // Trigger financial analytics update
            await FinancialAnalyticsService.updateFinancialMetricsOnPayment(oop);

            return {
               success: true,
               message: 'Payment confirmed and proof generated successfully',
               transactionId: reference,
               paymentStatus: 'COMPLETED'
            };
         } catch (error) {
            throw new Error(`Failed to confirm payment: ${error.message}`);
         }
      },

      verifyPayment: async (_, { paymentId, status }) => {
         try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
               throw new Error('Payment not found');
            }

            // Update payment status
            payment.status = status;
            await payment.save();

            // Update OOP status if payment is verified
            if (status === 'VERIFIED') {
               const oop = await OOP.findByIdAndUpdate(payment.oopId, {
                  OOPstatus: 'Completed OOP'
               }, { new: true });

               // Update financial metrics
               await FinancialAnalyticsService.updateFinancialMetricsOnPayment(oop);
            }
            if (status === 'REJECTED') {
               await OOP.findByIdAndUpdate(payment.oopId, {
                  OOPstatus: 'Payment Proof Rejected'
               });
            }

            return {
               success: true,
               message: 'Payment verification updated successfully',
               payment
            };
         } catch (error) {
            throw new Error(`Failed to verify payment: ${error.message}`);
         }
      },
   }
};

module.exports = paymentResolvers;
