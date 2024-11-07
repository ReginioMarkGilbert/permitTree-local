const OOP = require('../models/OOP');
const mongoose = require('mongoose');

const paymentResolvers = {
   Mutation: {
      initiatePayment: async (_, { oopId, method }, { user }) => {
         try {
            const oop = await OOP.findById(oopId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            // Create a payment session
            return {
               id: new mongoose.Types.ObjectId().toString(),
               oopId: oop._id,
               status: 'PENDING',
               amount: oop.totalAmount,
               paymentMethod: method,
               createdAt: new Date().toISOString(),
               expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour expiry
            };
         } catch (error) {
            console.error('Error initiating payment:', error);
            throw error;
         }
      },

      confirmPayment: async (_, { oopId, reference }, { user }) => {
         try {
            const oop = await OOP.findById(oopId);
            if (!oop) {
               throw new Error('OOP not found');
            }

            // Update OOP status and payment details
            oop.OOPstatus = 'Payment Proof Submitted';
            oop.paymentStatus = 'PAID';
            oop.paymentReference = reference;
            oop.paymentDate = new Date();
            await oop.save();

            return {
               success: true,
               message: 'Payment confirmed successfully',
               transactionId: reference,
               paymentStatus: 'COMPLETED'
            };
         } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
         }
      }
   }
};

module.exports = paymentResolvers;
