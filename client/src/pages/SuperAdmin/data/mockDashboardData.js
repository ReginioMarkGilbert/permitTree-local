import { KeyRound, UserCog, UserPlus } from 'lucide-react';

export const mockDashboardData = {
   totalUsers: 1234,
   activeUsers: 987,
   totalApplications: 456,
   pendingApplications: 89,
   usersTrend: "12% increase from last month",
   activeUsersTrend: "8% increase from last month",
   applicationsTrend: "3% increase from last month",
   pendingApplicationsTrend: "5% increase from last month",
   userActivity: [
      { date: '2024-01', users: 400 },
      { date: '2024-02', users: 600 },
      { date: '2024-03', users: 550 },
      { date: '2024-04', users: 800 },
      { date: '2024-05', users: 950 },
   ],
   recentActivities: [
      {
         id: 1,
         type: 'password_change',
         username: 'john_doe',
         timestamp: '2024-03-15T14:30:00',
         icon: KeyRound,
         description: 'changed their password'
      },
      {
         id: 2,
         type: 'profile_update',
         username: 'jane_smith',
         timestamp: '2024-03-15T13:45:00',
         icon: UserCog,
         description: 'updated their profile'
      },
      {
         id: 3,
         type: 'new_registration',
         username: 'new_user123',
         timestamp: '2024-03-15T12:15:00',
         icon: UserPlus,
         description: 'registered a new account'
      }
   ]
};
