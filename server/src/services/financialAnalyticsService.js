const { OOP } = require('../models/OOP');
const Permit = require('../models/permits/Permit');
const Payment = require('../models/Payment');
const moment = require('moment');

class FinancialAnalyticsService {
   async getFinancialAnalytics(timeFilter) {
      try {
         const startDate = this.getStartDate(timeFilter);
         const oops = await OOP.find({
            createdAt: { $gte: startDate }
         }).populate('applicationId');

         // Fetch completed payments
         const completedPayments = await Payment.find({
            status: 'COMPLETED',
            createdAt: { $gte: startDate }
         });

         return {
            revenueStats: await this.getRevenueStats(oops, completedPayments),
            monthlyRevenue: await this.getMonthlyRevenue(oops, completedPayments),
            paymentStatus: await this.getPaymentStatusStats(oops, completedPayments),
            permitTypeRevenue: await this.getPermitTypeRevenue(oops, completedPayments)
         };
      } catch (error) {
         console.error('Error in getFinancialAnalytics:', error);
         throw error;
      }
   }

   getStartDate(timeFilter) {
      switch (timeFilter) {
         case 'week':
            return moment().subtract(7, 'days').toDate();
         case 'month':
            return moment().subtract(30, 'days').toDate();
         case 'year':
            return moment().subtract(1, 'year').toDate();
         default:
            return moment().subtract(5, 'years').toDate();
      }
   }

   async getRevenueStats(oops, completedPayments) {
      const stats = oops.reduce((acc, oop) => {
         const total = oop.totalAmount || 0;

         if (oop.OOPstatus === 'Completed OOP') {
            acc.total += total;
            acc.paid += total;
         } else if (oop.OOPstatus === 'Awaiting Payment') {
            acc.pending += total;
         } else if (this.isOverdue(oop)) {
            acc.overdue += total;
         }

         return acc;
      }, { total: 0, paid: 0, pending: 0, overdue: 0 });

      // Add completed payments to paid amount
      const additionalPaid = completedPayments.reduce((total, payment) => total + payment.amount, 0);
      stats.paid += additionalPaid;
      stats.total += additionalPaid;

      return stats;
   }

   async getMonthlyRevenue(oops, completedPayments) {
      const monthlyData = oops.reduce((acc, oop) => {
         if (oop.OOPstatus === 'Completed OOP') {
            const month = moment(oop.createdAt).format('MMM YYYY');
            if (!acc[month]) {
               acc[month] = { revenue: 0, target: 100000 }; // Example target
            }
            acc[month].revenue += oop.totalAmount || 0;
         }
         return acc;
      }, {});

      // Add completed payments to monthly revenue
      completedPayments.forEach(payment => {
         const month = moment(payment.createdAt).format('MMM YYYY');
         if (!monthlyData[month]) {
            monthlyData[month] = { revenue: 0, target: 100000 };
         }
         monthlyData[month].revenue += payment.amount;
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
         month,
         revenue: data.revenue,
         target: data.target
      }));
   }

   async getPaymentStatusStats(oops, completedPayments) {
      const statusStats = oops.reduce((acc, oop) => {
         const status = oop.OOPstatus;
         if (!acc[status]) {
            acc[status] = { count: 0, amount: 0 };
         }
         acc[status].count += 1;
         acc[status].amount += oop.totalAmount || 0;
         return acc;
      }, {});

      // Add completed payments to payment status stats
      statusStats['COMPLETED'] = {
         count: completedPayments.length,
         amount: completedPayments.reduce((total, payment) => total + payment.amount, 0)
      };

      return Object.entries(statusStats).map(([status, stats]) => ({
         status,
         count: stats.count,
         amount: stats.amount
      }));
   }

   async getPermitTypeRevenue(oops, completedPayments) {
      const typeStats = oops.reduce((acc, oop) => {
         if (oop.applicationId && oop.OOPstatus === 'Completed OOP') {
            const permitType = oop.applicationId.applicationType;
            if (!acc[permitType]) {
               acc[permitType] = { revenue: 0, count: 0 };
            }
            acc[permitType].revenue += oop.totalAmount || 0;
            acc[permitType].count += 1;
         }
         return acc;
      }, {});

      // Add completed payments to permit type revenue
      completedPayments.forEach(async payment => {
         const oop = await OOP.findById(payment.oopId).populate('applicationId');
         if (oop && oop.applicationId) {
            const permitType = oop.applicationId.applicationType;
            if (!typeStats[permitType]) {
               typeStats[permitType] = { revenue: 0, count: 0 };
            }
            typeStats[permitType].revenue += payment.amount;
            typeStats[permitType].count += 1;
         }
      });

      return Object.entries(typeStats).map(([permitType, stats]) => ({
         permitType,
         revenue: stats.revenue,
         count: stats.count
      }));
   }

   async updateFinancialMetricsOnPayment(oop) {
      try {
         // Fetch the corresponding payment
         const payment = await Payment.findOne({
            oopId: oop._id,
            status: 'COMPLETED'
         });

         if (!payment) {
            console.warn('No completed payment found for OOP:', oop._id);
            return;
         }

         // Update OOP status if not already updated
         if (oop.OOPstatus !== 'Completed OOP') {
            await OOP.findByIdAndUpdate(oop._id, {
               OOPstatus: 'Completed OOP'
            });
         }

         // Log the financial update
         console.log(`Financial metrics updated for payment: ${payment._id}, OOP: ${oop._id}, Amount: ${payment.amount}`);

         // Optional: You could trigger a recalculation of financial analytics here
         // await this.recalculateFinancialAnalytics();

         return {
            success: true,
            paymentId: payment._id,
            amount: payment.amount
         };
      } catch (error) {
         console.error('Error updating financial metrics:', error);
         throw new Error(`Failed to update financial metrics: ${error.message}`);
      }
   }

   async recalculateFinancialAnalytics() {
      try {
         const startDate = moment().subtract(1, 'year').toDate();
         const oops = await OOP.find({
            createdAt: { $gte: startDate },
            OOPstatus: 'Completed OOP'
         });

         const completedPayments = await Payment.find({
            status: 'COMPLETED',
            createdAt: { $gte: startDate }
         });

         // Perform comprehensive financial analytics recalculation
         const financialAnalytics = {
            revenueStats: await this.getRevenueStats(oops, completedPayments),
            monthlyRevenue: await this.getMonthlyRevenue(oops, completedPayments),
            paymentStatus: await this.getPaymentStatusStats(oops, completedPayments),
            permitTypeRevenue: await this.getPermitTypeRevenue(oops, completedPayments)
         };

         // Optional: Store or broadcast these analytics
         return financialAnalytics;
      } catch (error) {
         console.error('Error recalculating financial analytics:', error);
         throw error;
      }
   }

   isOverdue(oop) {
      // Check if the OOP is overdue based on payment deadline
      const now = moment();
      const paymentDeadline = moment(oop.createdAt).add(30, 'days');
      return oop.OOPstatus !== 'Completed OOP' && now.isAfter(paymentDeadline);
   }
}

module.exports = new FinancialAnalyticsService();
