const { OOP } = require('../models/OOP');
const Permit = require('../models/permits/Permit');
const moment = require('moment');

class FinancialAnalyticsService {
   async getFinancialAnalytics(timeFilter) {
      try {
         const startDate = this.getStartDate(timeFilter);
         const oops = await OOP.find({
            createdAt: { $gte: startDate }
         }).populate('applicationId');

         return {
            revenueStats: await this.getRevenueStats(oops),
            monthlyRevenue: await this.getMonthlyRevenue(oops),
            paymentStatus: await this.getPaymentStatusStats(oops),
            permitTypeRevenue: await this.getPermitTypeRevenue(oops)
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

   async getRevenueStats(oops) {
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

      return stats;
   }

   async getMonthlyRevenue(oops) {
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

      return Object.entries(monthlyData).map(([month, data]) => ({
         month,
         revenue: data.revenue,
         target: data.target
      }));
   }

   async getPaymentStatusStats(oops) {
      const statusStats = oops.reduce((acc, oop) => {
         const status = oop.OOPstatus;
         if (!acc[status]) {
            acc[status] = { count: 0, amount: 0 };
         }
         acc[status].count += 1;
         acc[status].amount += oop.totalAmount || 0;
         return acc;
      }, {});

      return Object.entries(statusStats).map(([status, stats]) => ({
         status,
         count: stats.count,
         amount: stats.amount
      }));
   }

   async getPermitTypeRevenue(oops) {
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

      return Object.entries(typeStats).map(([permitType, stats]) => ({
         permitType,
         revenue: stats.revenue,
         count: stats.count
      }));
   }

   isOverdue(oop) {
      const dueDate = moment(oop.createdAt).add(30, 'days');
      return moment().isAfter(dueDate) && oop.OOPstatus !== 'Completed OOP';
   }
}

module.exports = new FinancialAnalyticsService();
