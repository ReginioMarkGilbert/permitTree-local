const Payment = require('../models/Payment');
const OOP = require('../models/OOP');

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
               await OOP.findByIdAndUpdate(payment.oopId, {
                  // OOPstatus: 'Payment Proof Approved'
                  OOPstatus: 'Completed OOP'
               });
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
