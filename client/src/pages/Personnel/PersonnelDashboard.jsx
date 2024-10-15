import React from 'react';
import ReceivingReleasingClerkDashboard from './components/PersonnelDashboardComponents/ReceivingReleasingClerkDashboard';
import TechnicalStaffDashboard from './components/PersonnelDashboardComponents/TechnicalStaffDashboard';
import ChiefDashboard from './components/PersonnelDashboardComponents/ChiefDashboard';
import AccountantDashboard from './components/PersonnelDashboardComponents/AccountantDashboard';
import BillCollectorDashboard from './components/PersonnelDashboardComponents/BillCollectorDashboard';
import PENRCENROfficerDashboard from './components/PersonnelDashboardComponents/PENRCENROfficerDashboard';
import { getUserRole } from '../../utils/auth';

const PersonnelDashboard = () => {
   const userRole = getUserRole();
   switch (userRole) {
      case 'Receiving_Clerk':
      case 'Releasing_Clerk':
         return <ReceivingReleasingClerkDashboard />;
      case 'Technical_Staff':
         return <TechnicalStaffDashboard />;
      case 'Chief_RPS':
      case 'Chief_TSD':
         console.log("Chief Dashboard");
         return <ChiefDashboard />;
      case 'Accountant':
         return <AccountantDashboard />;
      case 'Bill_Collector':
         return <BillCollectorDashboard />;
      case 'PENR_CENR_Officer':
         return <PENRCENROfficerDashboard />;
      default:
         return <div>Invalid role: {userRole}</div>;
   }
};

export default PersonnelDashboard;
