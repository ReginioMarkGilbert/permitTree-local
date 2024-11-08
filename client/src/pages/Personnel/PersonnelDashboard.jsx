import React from 'react';
import ReceivingReleasingClerkDashboard from './components/PersonnelDashboardComponents/ReceivingReleasingClerk/ReceivingReleasingClerkDashboard';
import TechnicalStaffDashboard from './components/PersonnelDashboardComponents/TechnicalStaff/TechnicalStaffDashboard';
import ChiefDashboard from './components/PersonnelDashboardComponents/Chief/ChiefDashboard';
import AccountantDashboard from './components/PersonnelDashboardComponents/Accountant/AccountantDashboard';
import BillCollectorDashboard from './components/PersonnelDashboardComponents/BillCollector/BillCollectorDashboard';
import PENRCENROfficerDashboard from './components/PersonnelDashboardComponents/PENRCENROfficerDashboard';
import InspectionTeamDashboard from './components/PersonnelDashboardComponents/InspectionTeamDashboard';
import { getUserRoles } from '../../utils/auth';

const PersonnelDashboard = () => {
   const userRoles = getUserRoles();

   if (userRoles.includes('Receiving_Clerk') || userRoles.includes('Releasing_Clerk')) {
      return <ReceivingReleasingClerkDashboard />;
   } else if (userRoles.includes('Technical_Staff') || userRoles.includes('Receiving_Clerk') || userRoles.includes('Releasing_Clerk')) {
      return <TechnicalStaffDashboard />;
   } else if (userRoles.includes('Chief_RPS') || userRoles.includes('Chief_TSD')) {
      console.log("Chief Dashboard");
      return <ChiefDashboard />;
   } else if (userRoles.includes('Accountant') || userRoles.includes('OOP_Staff_Incharge')) {
      return <AccountantDashboard />;
   } else if (userRoles.includes('Bill_Collector') || userRoles.includes('Credit_Officer')) {
      return <BillCollectorDashboard />;
   } else if (userRoles.includes('PENR_CENR_Officer') || userRoles.includes('Deputy_CENR_Officer')) {
      return <PENRCENROfficerDashboard />;
   } else if (userRoles.includes('Inspection_Team')) {
      return <InspectionTeamDashboard />;
   } else {
      return <div>Invalid roles: {userRoles.join(', ')}</div>;
   }
};

export default PersonnelDashboard;
